import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult } from '../interfaces/parser.interface';
import { LLMService } from '../../llm';
import { z } from 'zod';

const TransactionSchema = z.object({
  date: z.string().describe('ISO 8601 format WITH EXACT TIME. Parse HH:MM from the text and combine with date (e.g. 2026-05-15T19:14:00.000Z). Default 00:00:00 if missing.'),
  amount: z.number(),
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string(),
  merchantName: z.string().describe('Highly cleaned merchant name. E.g. RAZ*SWIGGYBengaluru -> Swiggy. WWW DINEOUT CO IN -> Dineout. EMINYKAA -> Nykaa. Remove locations, gateways, and domains.'),
  balance: z.number().optional(),
});

const ParseResultSchema = z.object({
  transactions: z.array(TransactionSchema),
  bankName: z.string(),
  healthScore: z.number().min(0).max(100),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
});

@Injectable()
export class LlmFallbackStrategy implements BankParserStrategy {
  constructor(private readonly llmService: LLMService) {}

  async parse(text: string): Promise<ParseResult> {
    const systemInstruction = `You are an expert bank statement parser.
You are given masked bank statement text where PII like account numbers might be replaced with generic tokens.
Your task is to extract transactions into structured JSON format.
Calculate the healthScore (0-100) based on how well you could parse the text (100 = perfectly).
Return warnings if any lines looked like transactions but could not be parsed.`;

    // SMART FILTER: PDFs often contain thousands of lines of useless Terms & Conditions, 
    // headers, and marketing fluff. Sending this to an LLM wastes massive amounts of tokens.
    // We will filter the text to only include lines that are likely to contain transaction data.
    const compressedText = text
      .split('\n')
      .map(line => line.trim())
      // Keep lines that have at least one digit (transactions always have dates/amounts)
      // And ignore massive paragraphs (T&Cs)
      .filter(line => /\d/.test(line) && line.length > 5 && line.length < 200)
      .join('\n');

    const result = await this.llmService.generateStructured({
      prompt: `Please parse this bank statement text:\n\n${compressedText}`,
      systemInstruction,
      schema: ParseResultSchema,
    });

    // Convert date strings to Date objects
    const parsedTransactions = result.transactions.map(tx => ({
      ...tx,
      date: new Date(tx.date)
    }));

    return {
      ...result,
      transactions: parsedTransactions,
    };
  }
}
