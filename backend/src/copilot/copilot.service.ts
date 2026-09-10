import { Injectable, Logger } from '@nestjs/common';
import { LLMService } from '../llm';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly prisma: PrismaService,
  ) {}

  async askCopilot(userId: string, question: string): Promise<string> {
    const systemInstruction = `You are an expert personal finance AI assistant named 'Kitna Kharcha Copilot'.
You have access to powerful tools to query the user's financial database.
When the user asks a question, call the appropriate tool to fetch the data, then analyze the result and answer the user clearly.
If the data returned by the tool is empty, politely inform the user.
Be concise, friendly, and analytical. Identify trends if relevant.`;

    const tools = [
      {
        name: 'get_category_breakdown',
        description: 'Get total spending grouped by category.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        }
      },
      {
        name: 'merchant_analysis',
        description: 'Find all transactions and total spend for a specific merchant keyword.',
        parameters: {
          type: 'OBJECT',
          properties: {
            keyword: { type: 'STRING', description: 'The merchant name to search for (e.g., Swiggy, Zomato, Amazon)' }
          },
          required: ['keyword']
        }
      },
      {
        name: 'detect_anomalies',
        description: 'Detect unusually large expenses or duplicate transactions.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        }
      }
    ];

    try {
      // 1. Initial Prompt with Tools
      this.logger.log(`Copilot Tool Execution Started for question: "${question}"`);
      const { text, toolCalls } = await this.llmService.generateWithTools({
        prompt: question,
        systemInstruction,
        tools,
        temperature: 0.1,
      });

      // If no tools called, just return the text
      if (!toolCalls || toolCalls.length === 0) {
        return text || "I couldn't figure out which data to look at for that.";
      }

      // 2. Execute Tools
      let toolResponses = '';
      for (const call of toolCalls) {
        this.logger.log(`Executing Tool: ${call.name} with args: ${JSON.stringify(call.arguments)}`);
        let result = '';
        
        if (call.name === 'get_category_breakdown') {
          result = await this.executeCategoryBreakdown(userId);
        } else if (call.name === 'merchant_analysis') {
          result = await this.executeMerchantAnalysis(userId, call.arguments?.keyword || '');
        } else if (call.name === 'detect_anomalies') {
          result = await this.executeDetectAnomalies(userId);
        } else {
          result = `Error: Tool ${call.name} not found.`;
        }
        
        toolResponses += `\n[Tool Result - ${call.name}]:\n${result}\n`;
      }

      // 3. Final Answer Phase
      // We pass the user's original question AND the tool results back to the LLM
      const finalPrompt = `Original Question: ${question}\n\nHere is the raw data retrieved from the database:\n${toolResponses}\n\nPlease formulate a final, helpful response to the user based on this data.`;
      
      const finalResponse = await this.llmService.generateText({
        prompt: finalPrompt,
        systemInstruction,
      });

      return finalResponse;

    } catch (e) {
      this.logger.error('Copilot Error:', e);
      return "I encountered an error trying to process your request.";
    }
  }

  // --- TOOL IMPLEMENTATIONS ---

  private async executeCategoryBreakdown(userId: string): Promise<string> {
    const txns = await this.prisma.transaction.findMany({
      where: { statement: { userId }, direction: 'DEBIT' },
      include: { category: true }
    });

    if (txns.length === 0) return "No expenses found.";

    const breakdown: Record<string, number> = {};
    for (const t of txns) {
      const cat = t.category?.name || 'Uncategorized';
      breakdown[cat] = (breakdown[cat] || 0) + Math.abs(Number(t.amountSigned));
    }

    // Format as string
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join('\n');
  }

  private async executeMerchantAnalysis(userId: string, keyword: string): Promise<string> {
    if (!keyword) return "Please specify a merchant keyword.";
    
    const txns = await this.prisma.transaction.findMany({
      where: { 
        statement: { userId },
        normalizedDescription: { contains: keyword, mode: 'insensitive' }
      },
      orderBy: { txnDate: 'desc' }
    });

    if (txns.length === 0) return `No transactions found matching "${keyword}".`;

    const total = txns.reduce((sum, t) => sum + Number(t.amountSigned), 0);
    const details = txns.map(t => `${t.txnDate.toISOString().split('T')[0]}: ₹${t.amountSigned} (${t.normalizedDescription})`).join('\n');
    
    return `Found ${txns.length} transactions for "${keyword}".\nTotal Net Spend: ₹${total.toFixed(2)}\n\nDetails:\n${details}`;
  }

  private async executeDetectAnomalies(userId: string): Promise<string> {
    const txns = await this.prisma.transaction.findMany({
      where: { statement: { userId }, direction: 'DEBIT' },
    });

    if (txns.length === 0) return "No transactions to analyze.";

    const amounts = txns.map(t => Math.abs(Number(t.amountSigned)));
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    // Flag anything > 3x the average
    const threshold = avg * 3;
    const anomalies = txns.filter(t => Math.abs(Number(t.amountSigned)) > threshold);

    if (anomalies.length === 0) return `No massive anomalies detected. Average spend is ₹${avg.toFixed(2)}.`;

    const details = anomalies.map(t => `ANOMALY: ${t.txnDate.toISOString().split('T')[0]} - ${t.normalizedDescription} for ₹${Math.abs(Number(t.amountSigned))} (Threshold was ₹${threshold.toFixed(2)})`).join('\n');
    return details;
  }
}
