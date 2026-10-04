import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PipelineProcessor } from '../src/pipeline/pipeline.processor';
import { MaskingService } from '../src/masking/masking.service';
import { ParserService } from '../src/parser/parser.service';
import { GenericStrategy } from '../src/parser/strategies/generic.strategy';
import { HdfcStrategy } from '../src/parser/strategies/hdfc.strategy';
import { SbiStrategy } from '../src/parser/strategies/sbi.strategy';
import { LlmFallbackStrategy } from '../src/parser/strategies/llm-fallback.strategy';
import { MerchantNormalizer } from '../src/parser/merchant/merchant-normalizer';
import { CurrencyService } from '../src/currency/currency.service';
import { ClassificationService } from '../src/classification/classification.service';
import { RuleEngineService } from '../src/classification/rule-engine/rule-engine.service';
import { LLMClassifierService } from '../src/classification/llm-classifier/llm-classifier.service';
import { DedupService } from '../src/dedup/dedup.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Job } from 'bullmq';
import * as fs from 'fs';

vi.mock('fs');

describe('Statement Ingestion Pipeline (End-to-End)', () => {
  let processor: PipelineProcessor;
  let createdTransactions: any[] = [];
  let prismaMock: any;

  beforeEach(() => {
    createdTransactions = [];

    // Real services wired together
    const normalizer = new MerchantNormalizer();
    const genericStrategy = new GenericStrategy(normalizer);
    const hdfcStrategy = new HdfcStrategy(genericStrategy);
    const sbiStrategy = new SbiStrategy(genericStrategy);
    const llmFallbackMock = { parse: vi.fn() } as unknown as LlmFallbackStrategy;
    const parserService = new ParserService(hdfcStrategy, sbiStrategy, genericStrategy, llmFallbackMock);

    const maskingService = new MaskingService();
    const currencyService = new CurrencyService();
    const ruleEngineService = new RuleEngineService();
    const llmClassifierMock = {
      classify: vi.fn(),
      classifyBatch: vi.fn().mockImplementation((txns) =>
        txns.map(() => ({
          categoryId: 'cat_food',
          confidence: 0.95,
          reason: 'LLM_CLASSIFIED',
          tags: ['food'],
        })),
      ),
    } as unknown as LLMClassifierService;

    const classificationService = new ClassificationService(ruleEngineService, llmClassifierMock);
    const dedupService = { isDuplicate: vi.fn().mockResolvedValue(false) } as unknown as DedupService;

    prismaMock = {
      statementUpload: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'stmt_e2e_001',
          userId: 'user_e2e',
          filePath: '/mock/uploads/bank-statement.txt',
          inputType: 'TEXT',
          user: { defaultCurrency: 'INR' },
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      classificationRule: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'rule_swiggy',
            userId: 'user_e2e',
            categoryId: 'cat_dining',
            priority: 10,
            conditions: JSON.stringify({ field: 'description', operator: 'CONTAINS', value: 'SWIGGY' }),
            tags: ['dining', 'takeout'],
          },
          {
            id: 'rule_salary',
            userId: 'user_e2e',
            categoryId: 'cat_income',
            priority: 10,
            conditions: JSON.stringify({ field: 'description', operator: 'CONTAINS', value: 'SALARY' }),
            tags: ['income'],
          },
        ]),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'cat_dining', name: 'Food & Dining', type: 'EXPENSE' },
          { id: 'cat_income', name: 'Salary / Income', type: 'INCOME' },
        ]),
      },
      transaction: {
        create: vi.fn().mockImplementation(({ data }) => {
          createdTransactions.push(data);
          return Promise.resolve({ id: `txn_${createdTransactions.length}`, ...data });
        }),
      },
    } as unknown as PrismaService;

    processor = new PipelineProcessor(
      prismaMock,
      maskingService,
      parserService,
      dedupService,
      currencyService,
      classificationService,
    );
  });

  it('should accurately parse amounts, running balances, and categories end-to-end', async () => {
    // A realistic statement text containing:
    // 1. UPI transaction with 12-digit ref and cheque number
    // 2. High-value comma amount without decimals
    // 3. Salary credit with commas and no decimals
    // 4. Ride share debit with decimal amount and balance
    const statementContent = `
Account Statement for HDFC Bank
Date Particulars Chq/Ref No Value Date Debit Credit Balance
15/01/2026 UPI-SWIGGY-402918237192-PAYMENT 000000000452 15/01/2026 450.00 25,000.00
16/01/2026 LAPTOP STORE PURCHASE 12,500 12,500.00
01/02/2026 TCS MONTHLY SALARY PAY 1,50,000 1,62,500.00
05/02/2026 UBER INDIA HYDERABAD 320.00 1,62,180.00
    `.trim();

    vi.spyOn(fs, 'readFileSync').mockReturnValue(statementContent as any);

    const job = { data: { uploadId: 'stmt_e2e_001' } } as Job;
    await processor.process(job);

    expect(createdTransactions).toHaveLength(4);

    // Row 1: Swiggy UPI
    expect(createdTransactions[0].amountSigned).toBe(-450);
    expect(createdTransactions[0].debitAmount).toBe(450);
    expect(createdTransactions[0].creditAmount).toBeNull();
    expect(createdTransactions[0].balance).toBe(25000);
    expect(createdTransactions[0].normalizedDescription).toBe('Swiggy');
    expect(createdTransactions[0].categoryId).toBe('cat_dining');

    // Row 2: Laptop (12,500 without decimals)
    expect(createdTransactions[1].amountSigned).toBe(-12500);
    expect(createdTransactions[1].debitAmount).toBe(12500);
    expect(createdTransactions[1].balance).toBe(12500);

    // Row 3: Salary (1,50,000 without decimals)
    expect(createdTransactions[2].amountSigned).toBe(150000);
    expect(createdTransactions[2].creditAmount).toBe(150000);
    expect(createdTransactions[2].debitAmount).toBeNull();
    expect(createdTransactions[2].balance).toBe(162500);
    expect(createdTransactions[2].categoryId).toBe('cat_income');

    // Row 4: Uber
    expect(createdTransactions[3].amountSigned).toBe(-320);
    expect(createdTransactions[3].debitAmount).toBe(320);
    expect(createdTransactions[3].balance).toBe(162180);
    expect(createdTransactions[3].normalizedDescription).toBe('Uber');

    // Check statement status updated to COMPLETED with high health score
    expect(prismaMock.statementUpload.update).toHaveBeenCalledWith({
      where: { id: 'stmt_e2e_001' },
      data: {
        parseStatus: 'COMPLETED',
        healthScore: 100,
        contentFingerprint: expect.any(String),
      },
    });
  });
});
