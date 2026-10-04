import { Injectable, Logger } from '@nestjs/common';
import { LLMService } from '../llm';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';
import { Direction, Prisma } from '@prisma/client';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly prisma: PrismaService,
    private readonly recurringService: RecurringService,
  ) {}

  async getSessionHistory(
    userId: string,
  ): Promise<Array<{ role: 'user' | 'ai'; content: string; timestamp?: string }>> {
    const session = await this.prisma.copilotSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    if (!session || !Array.isArray(session.messages)) {
      return [];
    }
    return session.messages as any;
  }

  async saveMessageToSession(userId: string, role: 'user' | 'ai', content: string) {
    try {
      let session = await this.prisma.copilotSession.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      const newMsg = { role, content, timestamp: new Date().toISOString() };

      if (!session) {
        await this.prisma.copilotSession.create({
          data: {
            userId,
            messages: [newMsg],
          },
        });
      } else {
        const existing = Array.isArray(session.messages) ? (session.messages as any[]) : [];
        await this.prisma.copilotSession.update({
          where: { id: session.id },
          data: {
            messages: [...existing, newMsg],
          },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to save copilot session message: ${err}`);
    }
  }

  async clearSessionHistory(userId: string) {
    await this.prisma.copilotSession.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  async askCopilot(userId: string, question: string): Promise<string> {
    const systemInstruction = `You are an expert personal finance AI assistant named 'Kitna Kharcha Copilot'.
You have access to powerful tools to query the user's financial database.
When the user asks a question, call the appropriate tool to fetch the data, then analyze the result and answer the user clearly.
Always answer in Indian Rupees (₹). Be concise, friendly, analytical, and suggest actionable tips when relevant.`;

    const tools = this.getToolDefinitions();

    // Persist incoming user question
    await this.saveMessageToSession(userId, 'user', question);

    try {
      this.logger.log(`Copilot Tool Execution Started for question: "${question}"`);
      const { text, toolCalls } = await this.llmService.generateWithTools({
        prompt: question,
        systemInstruction,
        tools,
        temperature: 0.1,
      });

      if (!toolCalls || toolCalls.length === 0) {
        const fallbackAnswer = text || "I couldn't find the necessary data to answer that question.";
        await this.saveMessageToSession(userId, 'ai', fallbackAnswer);
        return fallbackAnswer;
      }

      let toolResponses = '';
      for (const call of toolCalls) {
        this.logger.log(`Executing Tool: ${call.name} with args: ${JSON.stringify(call.arguments)}`);
        const result = await this.dispatchTool(userId, call.name, call.arguments || {});
        toolResponses += `\n[Tool Result - ${call.name}]:\n${result}\n`;
      }

      const finalPrompt = `User Question: ${question}\n\nData retrieved from financial database:\n${toolResponses}\n\nPlease formulate a helpful, well-structured final answer to the user based on this data.`;

      const finalResponse = await this.llmService.generateText({
        prompt: finalPrompt,
        systemInstruction,
      });

      await this.saveMessageToSession(userId, 'ai', finalResponse);
      return finalResponse;
    } catch (e) {
      this.logger.error('Copilot Error:', e);
      const errorMsg = 'I encountered an error trying to process your request. Please try again.';
      await this.saveMessageToSession(userId, 'ai', errorMsg);
      return errorMsg;
    }
  }

  public getToolDefinitions() {
    return [
      {
        name: 'query_transactions',
        description: 'Search and filter transactions with custom filters (date range, amounts, merchant, category, direction).',
        parameters: {
          type: 'OBJECT',
          properties: {
            startDate: { type: 'STRING', description: 'Start date (YYYY-MM-DD)' },
            endDate: { type: 'STRING', description: 'End date (YYYY-MM-DD)' },
            minAmount: { type: 'NUMBER', description: 'Minimum transaction amount' },
            maxAmount: { type: 'NUMBER', description: 'Maximum transaction amount' },
            merchant: { type: 'STRING', description: 'Merchant or keyword to search' },
            category: { type: 'STRING', description: 'Category name' },
            direction: { type: 'STRING', description: 'CREDIT or DEBIT' },
            limit: { type: 'NUMBER', description: 'Max records to return (default 20)' },
          },
        },
      },
      {
        name: 'get_monthly_trend',
        description: 'Get month-over-month income vs expense and net savings for the past N months.',
        parameters: {
          type: 'OBJECT',
          properties: {
            months: { type: 'NUMBER', description: 'Number of past months to analyze (default 6)' },
          },
        },
      },
      {
        name: 'get_recurring_expenses',
        description: 'Get all detected recurring commitments, subscriptions, EMIs, utilities, and total monthly recurring cost.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'suggest_budget',
        description: 'Calculate baseline budget recommendations per category based on historical 90-day spending habits.',
        parameters: {
          type: 'OBJECT',
          properties: {
            safetyMarginPercent: { type: 'NUMBER', description: 'Safety margin buffer percentage (default 10%)' },
          },
        },
      },
      {
        name: 'compare_periods',
        description: 'Compare financial spending and cash flows between two specific time periods.',
        parameters: {
          type: 'OBJECT',
          properties: {
            period1Start: { type: 'STRING', description: 'Period 1 start date (YYYY-MM-DD)' },
            period1End: { type: 'STRING', description: 'Period 1 end date (YYYY-MM-DD)' },
            period2Start: { type: 'STRING', description: 'Period 2 start date (YYYY-MM-DD)' },
            period2End: { type: 'STRING', description: 'Period 2 end date (YYYY-MM-DD)' },
          },
          required: ['period1Start', 'period1End', 'period2Start', 'period2End'],
        },
      },
      {
        name: 'merchant_analysis',
        description: 'Detailed spending analysis for a specific merchant with date range filtering.',
        parameters: {
          type: 'OBJECT',
          properties: {
            keyword: { type: 'STRING', description: 'Merchant name or keyword (e.g. Swiggy, Amazon, Uber)' },
            startDate: { type: 'STRING', description: 'Optional start date (YYYY-MM-DD)' },
            endDate: { type: 'STRING', description: 'Optional end date (YYYY-MM-DD)' },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'get_category_breakdown',
        description: 'Get categorized spending or income totals with optional date filters.',
        parameters: {
          type: 'OBJECT',
          properties: {
            startDate: { type: 'STRING', description: 'Optional start date (YYYY-MM-DD)' },
            endDate: { type: 'STRING', description: 'Optional end date (YYYY-MM-DD)' },
            direction: { type: 'STRING', description: 'DEBIT (expenses) or CREDIT (income), default DEBIT' },
          },
        },
      },
      {
        name: 'detect_anomalies',
        description: 'Detect abnormal spikes in spending or potential duplicate charges.',
        parameters: {
          type: 'OBJECT',
          properties: {
            thresholdMultiplier: { type: 'NUMBER', description: 'Multiplier of average spend to flag as anomaly (default 3)' },
          },
        },
      },
      {
        name: 'create_classification_rule',
        description: 'Create a custom categorization rule for a specific merchant or keyword.',
        parameters: {
          type: 'OBJECT',
          properties: {
            merchantKeyword: { type: 'STRING', description: 'Merchant name or keyword to match (e.g. Swiggy, Nykaa, Dineout)' },
            categoryName: { type: 'STRING', description: 'Target category name (e.g. Food & Dining, Shopping)' },
            tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Optional list of tags' },
          },
          required: ['merchantKeyword', 'categoryName'],
        },
      },
    ];
  }

  public async dispatchTool(userId: string, toolName: string, args: Record<string, any>): Promise<string> {
    switch (toolName) {
      case 'query_transactions':
        return this.executeQueryTransactions(userId, args);
      case 'get_monthly_trend':
        return this.executeMonthlyTrend(userId, args?.months || 6);
      case 'get_recurring_expenses':
        return this.executeRecurringExpenses(userId);
      case 'suggest_budget':
        return this.executeSuggestBudget(userId, args?.safetyMarginPercent || 10);
      case 'compare_periods':
        return this.executeComparePeriods(
          userId,
          args.period1Start,
          args.period1End,
          args.period2Start,
          args.period2End,
        );
      case 'merchant_analysis':
        return this.executeMerchantAnalysis(userId, args.keyword, args.startDate, args.endDate);
      case 'get_category_breakdown':
        return this.executeCategoryBreakdown(userId, args.startDate, args.endDate, args.direction);
      case 'detect_anomalies':
        return this.executeDetectAnomalies(userId, args?.thresholdMultiplier || 3);
      case 'create_classification_rule':
        return this.executeCreateRule(userId, args);
      default:
        return `Error: Tool '${toolName}' is not recognized.`;
    }
  }

  // --- TOOL 1: query_transactions ---
  public async executeQueryTransactions(userId: string, filters: Record<string, any>): Promise<string> {
    const where: Prisma.TransactionWhereInput = {
      statement: { userId },
      isDuplicate: false,
    };

    if (filters.direction) {
      where.direction = filters.direction.toUpperCase() as Direction;
    }
    if (filters.startDate || filters.endDate) {
      where.txnDate = {};
      if (filters.startDate) where.txnDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.txnDate.lte = new Date(filters.endDate);
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amountSigned = {};
      if (filters.minAmount !== undefined) where.amountSigned.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amountSigned.lte = filters.maxAmount;
    }
    if (filters.merchant) {
      where.normalizedDescription = { contains: filters.merchant, mode: 'insensitive' };
    }
    if (filters.category) {
      where.category = { name: { contains: filters.category, mode: 'insensitive' } };
    }

    const txns = await this.prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { txnDate: 'desc' },
      take: filters.limit || 20,
    });

    if (txns.length === 0) {
      return 'No transactions matched the specified criteria.';
    }

    const total = txns.reduce((sum, t) => sum + Math.abs(Number(t.amountSigned)), 0);
    const rows = txns.map(t =>
      `${t.txnDate.toISOString().split('T')[0]} | ${t.direction === 'CREDIT' ? '+' : '-'}₹${Math.abs(Number(t.amountSigned))} | ${t.normalizedDescription || t.description} | Category: ${t.category?.name || 'Uncategorized'}`
    ).join('\n');

    return `Found ${txns.length} transactions (Total: ₹${total.toFixed(2)}):\n${rows}`;
  }

  // --- TOOL 2: get_monthly_trend ---
  public async executeMonthlyTrend(userId: string, months: number = 6): Promise<string> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        isDuplicate: false,
        txnDate: { gte: cutoff },
      },
      orderBy: { txnDate: 'asc' },
    });

    if (txns.length === 0) {
      return `No transactions found in the past ${months} months.`;
    }

    const monthlyMap = new Map<string, { income: number; expense: number }>();

    for (const t of txns) {
      const monthKey = t.txnDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      const val = Math.abs(Number(t.amountSigned));
      const entry = monthlyMap.get(monthKey)!;
      if (t.direction === 'CREDIT') {
        entry.income += val;
      } else {
        entry.expense += val;
      }
    }

    const rows = Array.from(monthlyMap.entries()).map(([month, data]) => {
      const net = data.income - data.expense;
      const savingsRate = data.income > 0 ? ((net / data.income) * 100).toFixed(1) + '%' : 'N/A';
      return `${month} => Income: ₹${data.income.toFixed(2)}, Expense: ₹${data.expense.toFixed(2)}, Net Savings: ₹${net.toFixed(2)} (Savings Rate: ${savingsRate})`;
    }).join('\n');

    return `Monthly Financial Trends (Past ${months} Months):\n${rows}`;
  }

  // --- TOOL 3: get_recurring_expenses ---
  public async executeRecurringExpenses(userId: string): Promise<string> {
    const result = await this.recurringService.getRecurring(userId);
    if (!result.groups || result.groups.length === 0) {
      return 'No recurring subscriptions or commitments currently detected.';
    }

    const items = result.groups.map(g =>
      `• ${g.merchantId || 'Unknown'} (${g.type}) - ₹${Number(g.avgAmount).toFixed(2)} / ${g.frequency.toLowerCase()} [${g.isActive ? 'ACTIVE' : 'INACTIVE'}]`
    ).join('\n');

    return `Recurring Subscriptions & Commitments:\n${items}\n\nTotal Monthly Recurring Commitment: ₹${result.summary.totalMonthlyCommitment.toFixed(2)} (${result.summary.activeCount} active items).`;
  }

  // --- TOOL 4: suggest_budget ---
  public async executeSuggestBudget(userId: string, safetyMarginPercent: number = 10): Promise<string> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        direction: 'DEBIT',
        isDuplicate: false,
        txnDate: { gte: ninetyDaysAgo },
      },
      include: { category: true },
    });

    if (txns.length === 0) {
      return 'Not enough historical spending data in the last 90 days to generate baseline budgets.';
    }

    const catTotals = new Map<string, number>();
    for (const t of txns) {
      const cat = t.category?.name || 'Uncategorized';
      const amt = Math.abs(Number(t.amountSigned));
      catTotals.set(cat, (catTotals.get(cat) || 0) + amt);
    }

    const recommendations = Array.from(catTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total90]) => {
        const monthlyAvg = total90 / 3;
        const recommended = Math.ceil((monthlyAvg * (1 + safetyMarginPercent / 100)) / 100) * 100;
        return `• ${cat}: Suggested Monthly Budget ₹${recommended.toLocaleString()} (Historical 3-month avg: ₹${Math.round(monthlyAvg).toLocaleString()})`;
      })
      .join('\n');

    return `AI Budget Recommendations (Based on 90-Day Spending with ${safetyMarginPercent}% buffer):\n${recommendations}`;
  }

  // --- TOOL 5: compare_periods ---
  public async executeComparePeriods(
    userId: string,
    p1Start: string,
    p1End: string,
    p2Start: string,
    p2End: string,
  ): Promise<string> {
    const fetchPeriod = async (start: string, end: string) => {
      const txns = await this.prisma.transaction.findMany({
        where: {
          statement: { userId },
          isDuplicate: false,
          txnDate: { gte: new Date(start), lte: new Date(end) },
        },
      });
      let expense = 0;
      let income = 0;
      for (const t of txns) {
        const val = Math.abs(Number(t.amountSigned));
        if (t.direction === 'CREDIT') income += val;
        else expense += val;
      }
      return { txnsCount: txns.length, expense, income, net: income - expense };
    };

    const p1 = await fetchPeriod(p1Start, p1End);
    const p2 = await fetchPeriod(p2Start, p2End);

    const expenseDelta = p2.expense - p1.expense;
    const expensePct = p1.expense > 0 ? ((expenseDelta / p1.expense) * 100).toFixed(1) + '%' : 'N/A';

    return `Comparison: Period 1 [${p1Start} to ${p1End}] vs Period 2 [${p2Start} to ${p2End}]:
• Period 1: ₹${p1.expense.toFixed(2)} expenses (${p1.txnsCount} txns), ₹${p1.income.toFixed(2)} income
• Period 2: ₹${p2.expense.toFixed(2)} expenses (${p2.txnsCount} txns), ₹${p2.income.toFixed(2)} income
• Expense Delta: ${expenseDelta >= 0 ? '+' : ''}₹${expenseDelta.toFixed(2)} (${expensePct})`;
  }

  // --- TOOL 6: merchant_analysis ---
  public async executeMerchantAnalysis(
    userId: string,
    keyword: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    if (!keyword) return 'Please specify a merchant name to analyze.';

    const where: Prisma.TransactionWhereInput = {
      statement: { userId },
      normalizedDescription: { contains: keyword, mode: 'insensitive' },
    };

    if (startDate || endDate) {
      where.txnDate = {};
      if (startDate) where.txnDate.gte = new Date(startDate);
      if (endDate) where.txnDate.lte = new Date(endDate);
    }

    const txns = await this.prisma.transaction.findMany({
      where,
      orderBy: { txnDate: 'desc' },
    });

    if (txns.length === 0) {
      const dateRangeStr = startDate && endDate ? ` between ${startDate} and ${endDate}` : '';
      return `No transactions found matching "${keyword}"${dateRangeStr}.`;
    }

    const totalDebit = txns
      .filter(t => t.direction === 'DEBIT')
      .reduce((sum, t) => sum + Math.abs(Number(t.amountSigned)), 0);

    const avg = totalDebit / (txns.filter(t => t.direction === 'DEBIT').length || 1);

    const details = txns.slice(0, 10).map(t =>
      `${t.txnDate.toISOString().split('T')[0]}: ₹${Math.abs(Number(t.amountSigned))} (${t.direction})`
    ).join('\n');

    return `Merchant Analysis for "${keyword}":
• Transactions: ${txns.length}
• Total Spend: ₹${totalDebit.toFixed(2)}
• Average per Transaction: ₹${avg.toFixed(2)}
Recent occurrences:
${details}`;
  }

  // --- TOOL 7: get_category_breakdown ---
  public async executeCategoryBreakdown(
    userId: string,
    startDate?: string,
    endDate?: string,
    direction: string = 'DEBIT',
  ): Promise<string> {
    const dir = (direction.toUpperCase() === 'CREDIT' ? 'CREDIT' : 'DEBIT') as Direction;

    const where: Prisma.TransactionWhereInput = {
      statement: { userId },
      direction: dir,
      isDuplicate: false,
    };

    if (startDate || endDate) {
      where.txnDate = {};
      if (startDate) where.txnDate.gte = new Date(startDate);
      if (endDate) where.txnDate.lte = new Date(endDate);
    }

    const txns = await this.prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    if (txns.length === 0) {
      return `No ${dir.toLowerCase()} transactions found for the given criteria.`;
    }

    const breakdown: Record<string, number> = {};
    let grandTotal = 0;

    for (const t of txns) {
      const cat = t.category?.name || 'Uncategorized';
      const val = Math.abs(Number(t.amountSigned));
      breakdown[cat] = (breakdown[cat] || 0) + val;
      grandTotal += val;
    }

    const rows = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => {
        const pct = ((amt / grandTotal) * 100).toFixed(1);
        return `• ${cat}: ₹${amt.toFixed(2)} (${pct}%)`;
      })
      .join('\n');

    return `Category Breakdown (${dir}): Total: ₹${grandTotal.toFixed(2)}\n${rows}`;
  }

  // --- TOOL 8: detect_anomalies ---
  public async executeDetectAnomalies(userId: string, thresholdMultiplier: number = 3): Promise<string> {
    const txns = await this.prisma.transaction.findMany({
      where: { statement: { userId }, direction: 'DEBIT', isDuplicate: false },
      orderBy: { txnDate: 'desc' },
      take: 100,
    });

    if (txns.length === 0) return 'No debit transactions available to analyze.';

    const amounts = txns.map(t => Math.abs(Number(t.amountSigned)));
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const threshold = avg * thresholdMultiplier;

    const anomalies = txns.filter(t => Math.abs(Number(t.amountSigned)) >= threshold);

    if (anomalies.length === 0) {
      return `No unusual spending spikes detected. Average debit transaction is ₹${avg.toFixed(2)} (Spike threshold: ₹${threshold.toFixed(2)}).`;
    }

    const details = anomalies.map(t =>
      `⚠️ ${t.txnDate.toISOString().split('T')[0]} - ₹${Math.abs(Number(t.amountSigned)).toFixed(2)} at ${t.normalizedDescription || t.description}`
    ).join('\n');

    return `Detected ${anomalies.length} spending spike(s) exceeding ${thresholdMultiplier}x average (Threshold: ₹${threshold.toFixed(2)}):\n${details}`;
  }

  // --- TOOL 9: create_classification_rule ---
  public async executeCreateRule(userId: string, args: Record<string, any>): Promise<string> {
    const merchantKeyword = (args.merchantKeyword || '').trim();
    const categoryName = (args.categoryName || '').trim();
    const tags = Array.isArray(args.tags) ? args.tags : [];

    if (!merchantKeyword || !categoryName) {
      return 'Error: Both merchantKeyword and categoryName are required to create a classification rule.';
    }

    // Find category matching categoryName case-insensitively
    const category = await this.prisma.category.findFirst({
      where: {
        name: { equals: categoryName, mode: 'insensitive' },
      },
    });

    if (!category) {
      const allCategories = await this.prisma.category.findMany({ select: { name: true } });
      const names = allCategories.map((c) => c.name).join(', ');
      return `Category "${categoryName}" not found. Available categories are: ${names}`;
    }

    const rule = await this.prisma.classificationRule.create({
      data: {
        userId,
        name: `User Rule: ${merchantKeyword}`,
        categoryId: category.id,
        tags,
        source: 'USER',
        priority: 50,
        conditions: {
          descriptionContains: merchantKeyword,
          normalizedMerchantContains: merchantKeyword,
        },
      },
    });

    return `Created rule: "${merchantKeyword}" will be automatically classified as "${category.name}". (Rule ID: ${rule.id})`;
  }
}
