import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult } from '../interfaces/parser.interface';
import { LLMService } from '../../llm';
import { z } from 'zod';

const TransactionSchema = z.object({
  date: z.string().describe('ISO 8601 date string'),
  amount: z.number(),
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string(),
  merchantName: z.string().optional(),
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

    const result = await this.llmService.generateStructured({
      prompt: `Please parse this bank statement text:\n\n${text}`,
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
