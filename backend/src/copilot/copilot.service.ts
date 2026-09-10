import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CopilotService {
  constructor(
    private readonly llmService: LLMService,
    private readonly prisma: PrismaService,
  ) {}

  async askCopilot(userId: string, question: string): Promise<string> {
    // 1. Fetch recent transactions for context
    const transactions = await this.prisma.transaction.findMany({
      where: { statement: { userId } },
      orderBy: { txnDate: 'desc' },
      take: 150, // Grab up to 150 recent txns
      include: { category: true }
    });

    // 2. Format the data compactly to save LLM tokens
    const contextData = transactions.map(t => 
      `${t.txnDate.toISOString().split('T')[0]} | ${t.normalizedDescription} | ${t.category?.name || 'Uncategorized'} | ₹${t.amountSigned}`
    ).join('\n');

    // 3. Prompt the LLM
    const systemInstruction = `You are an expert personal finance AI assistant named 'Kitna Kharcha Copilot'.
You help users understand their spending habits, identify trends, and answer questions about their transactions.
You will be provided with a list of the user's recent transactions in the format "Date | Merchant | Category | Amount". Negative amounts are expenses, positive are income.

Follow these rules strictly:
1. Be concise, friendly, and direct.
2. If the user asks about a specific merchant, calculate the total dynamically.
3. Only use the provided transaction data. Do not invent data.
4. If you don't know or the data doesn't contain the answer, say so clearly.`;

    const prompt = `User's Transactions Context:\n${contextData}\n\nUser Question: ${question}`;

    const response = await this.llmService.generateText({
      prompt,
      systemInstruction,
    });

    return response;
  }
}
