import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotService } from './copilot.service';
import { LLMService } from '../llm';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';
import { RecurringFreq, RecurringType } from '@prisma/client';

describe('CopilotService', () => {
  let service: CopilotService;
  let llmMock: any;
  let prismaMock: any;
  let recurringMock: any;

  beforeEach(() => {
    llmMock = {
      generateWithTools: vi.fn(),
      generateText: vi.fn(),
    };

    prismaMock = {
      transaction: {
        findMany: vi.fn(),
      },
      copilotSession: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
      category: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      classificationRule: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    recurringMock = {
      getRecurring: vi.fn(),
    };

    service = new CopilotService(
      llmMock as unknown as LLMService,
      prismaMock as unknown as PrismaService,
      recurringMock as unknown as RecurringService,
    );
  });

  it('should define all 9 copilot tools', () => {
    const tools = service.getToolDefinitions();
    expect(tools).toHaveLength(9);
    const names = tools.map(t => t.name);
    expect(names).toContain('query_transactions');
    expect(names).toContain('get_monthly_trend');
    expect(names).toContain('get_recurring_expenses');
    expect(names).toContain('suggest_budget');
    expect(names).toContain('compare_periods');
    expect(names).toContain('merchant_analysis');
    expect(names).toContain('get_category_breakdown');
    expect(names).toContain('detect_anomalies');
    expect(names).toContain('create_classification_rule');
  });

  it('should execute query_transactions tool correctly', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-02-01'),
        amountSigned: -450,
        direction: 'DEBIT',
        normalizedDescription: 'Swiggy',
        description: 'SWIGGY',
        category: { name: 'Food & Dining' },
      },
    ]);

    const result = await service.executeQueryTransactions('user-1', {
      merchant: 'Swiggy',
      direction: 'DEBIT',
    });

    expect(result).toContain('Found 1 transactions');
    expect(result).toContain('Swiggy');
    expect(result).toContain('Food & Dining');
  });

  it('should execute get_monthly_trend tool correctly', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-01-10'),
        amountSigned: 80000,
        direction: 'CREDIT',
      },
      {
        txnDate: new Date('2026-01-20'),
        amountSigned: -30000,
        direction: 'DEBIT',
      },
      {
        txnDate: new Date('2026-02-10'),
        amountSigned: 80000,
        direction: 'CREDIT',
      },
      {
        txnDate: new Date('2026-02-15'),
        amountSigned: -25000,
        direction: 'DEBIT',
      },
    ]);

    const result = await service.executeMonthlyTrend('user-1', 3);
    expect(result).toContain('Monthly Financial Trends');
    expect(result).toContain('2026-01');
    expect(result).toContain('2026-02');
    expect(result).toContain('Savings Rate');
  });

  it('should execute get_recurring_expenses tool correctly', async () => {
    recurringMock.getRecurring.mockResolvedValue({
      groups: [
        {
          merchantId: 'Netflix',
          type: RecurringType.SUBSCRIPTION,
          frequency: RecurringFreq.MONTHLY,
          avgAmount: 649,
          isActive: true,
        },
      ],
      summary: {
        totalMonthlyCommitment: 649,
        activeCount: 1,
      },
    });

    const result = await service.executeRecurringExpenses('user-1');
    expect(result).toContain('Netflix');
    expect(result).toContain('649');
    expect(result).toContain('1 active items');
  });

  it('should execute suggest_budget tool correctly', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      { amountSigned: -15000, category: { name: 'Food & Dining' } },
      { amountSigned: -6000, category: { name: 'Utilities' } },
    ]);

    const result = await service.executeSuggestBudget('user-1', 10);
    expect(result).toContain('AI Budget Recommendations');
    expect(result).toContain('Food & Dining');
    expect(result).toContain('Utilities');
  });

  it('should execute compare_periods tool correctly', async () => {
    prismaMock.transaction.findMany
      .mockResolvedValueOnce([
        { amountSigned: -20000, direction: 'DEBIT' },
        { amountSigned: 50000, direction: 'CREDIT' },
      ])
      .mockResolvedValueOnce([
        { amountSigned: -25000, direction: 'DEBIT' },
        { amountSigned: 50000, direction: 'CREDIT' },
      ]);

    const result = await service.executeComparePeriods(
      'user-1',
      '2026-01-01',
      '2026-01-31',
      '2026-02-01',
      '2026-02-28',
    );

    expect(result).toContain('Period 1: ₹20000.00');
    expect(result).toContain('Period 2: ₹25000.00');
    expect(result).toContain('Expense Delta: +₹5000.00');
  });

  it('should execute merchant_analysis with date range filter', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-01-15'),
        amountSigned: -450,
        direction: 'DEBIT',
        normalizedDescription: 'Swiggy',
      },
      {
        txnDate: new Date('2026-01-20'),
        amountSigned: -350,
        direction: 'DEBIT',
        normalizedDescription: 'Swiggy',
      },
    ]);

    const result = await service.executeMerchantAnalysis('user-1', 'Swiggy', '2026-01-01', '2026-01-31');
    expect(result).toContain('Merchant Analysis for "Swiggy"');
    expect(result).toContain('Total Spend: ₹800.00');
    expect(result).toContain('Average per Transaction: ₹400.00');
  });

  it('should execute get_category_breakdown correctly', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      { amountSigned: -3000, category: { name: 'Food' } },
      { amountSigned: -1000, category: { name: 'Transport' } },
    ]);

    const result = await service.executeCategoryBreakdown('user-1');
    expect(result).toContain('Category Breakdown (DEBIT)');
    expect(result).toContain('Food: ₹3000.00 (75.0%)');
    expect(result).toContain('Transport: ₹1000.00 (25.0%)');
  });

  it('should execute detect_anomalies correctly', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      { txnDate: new Date('2026-01-01'), amountSigned: -500, normalizedDescription: 'Groceries' },
      { txnDate: new Date('2026-01-02'), amountSigned: -400, normalizedDescription: 'Lunch' },
      { txnDate: new Date('2026-01-03'), amountSigned: -10000, normalizedDescription: 'Luxury Watch' },
    ]);

    const result = await service.executeDetectAnomalies('user-1', 2);
    expect(result).toContain('Detected 1 spending spike');
    expect(result).toContain('Luxury Watch');
  });

  it('should handle askCopilot full LLM tool-calling flow', async () => {
    llmMock.generateWithTools.mockResolvedValue({
      text: '',
      toolCalls: [
        {
          name: 'get_recurring_expenses',
          arguments: {},
        },
      ],
    });

    recurringMock.getRecurring.mockResolvedValue({
      groups: [],
      summary: { totalMonthlyCommitment: 0, activeCount: 0 },
    });

    llmMock.generateText.mockResolvedValue('You have no active subscriptions.');

    const answer = await service.askCopilot('user-1', 'What are my subscriptions?');
    expect(llmMock.generateWithTools).toHaveBeenCalled();
    expect(llmMock.generateText).toHaveBeenCalled();
    expect(answer).toBe('You have no active subscriptions.');
  });

  it('should get session history and save messages', async () => {
    prismaMock.copilotSession.findFirst.mockResolvedValue({
      id: 'session-1',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    const history = await service.getSessionHistory('user-1');
    expect(history).toHaveLength(1);
    expect(history[0].content).toBe('Hello');

    await service.clearSessionHistory('user-1');
    expect(prismaMock.copilotSession.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('should dispatch create_classification_rule and insert user rule in DB', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: 'cat-shopping',
      name: 'Shopping',
    });
    prismaMock.classificationRule.create.mockResolvedValue({
      id: 'rule-1',
    });

    const result = await service.dispatchTool('user-1', 'create_classification_rule', {
      merchantKeyword: 'Nykaa',
      categoryName: 'Shopping',
      tags: ['beauty', 'shopping'],
    });

    expect(result).toContain('Created rule');
    expect(result).toContain('Nykaa');
    expect(result).toContain('Shopping');
    expect(prismaMock.classificationRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          categoryId: 'cat-shopping',
          source: 'USER',
          priority: 50,
          conditions: {
            descriptionContains: 'Nykaa',
            normalizedMerchantContains: 'Nykaa',
          },
        }),
      }),
    );
  });
});
