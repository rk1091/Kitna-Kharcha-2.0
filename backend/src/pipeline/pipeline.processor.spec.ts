import { PipelineProcessor } from './pipeline.processor';
import { PrismaService } from '../prisma/prisma.service';
import { MaskingService } from '../masking/masking.service';
import { ParserService } from '../parser/parser.service';
import { DedupService } from '../dedup/dedup.service';
import { CurrencyService } from '../currency/currency.service';
import { ClassificationService } from '../classification/classification.service';
import { Job } from 'bullmq';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';

describe('PipelineProcessor', () => {
  let processor: PipelineProcessor;
  let prisma: PrismaService;
  let maskingService: MaskingService;
  let parserService: ParserService;
  let dedupService: DedupService;
  let currencyService: CurrencyService;
  let classificationService: ClassificationService;

  beforeEach(() => {
    prisma = {
      statementUpload: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'upload123',
          userId: 'user123',
          user: { defaultCurrency: 'INR' },
        }),
        update: vi.fn(),
      },
      classificationRule: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      transaction: {
        create: vi.fn(),
      }
    } as unknown as PrismaService;

    maskingService = {
      mask: vi.fn().mockResolvedValue({ maskedText: 'masked content' }),
    } as unknown as MaskingService;

    parserService = {
      parse: vi.fn().mockResolvedValue({
        transactions: [
          {
            date: new Date(),
            amount: 100,
            type: 'DEBIT',
            description: 'Test Txn',
          }
        ],
        bankName: 'Test Bank',
        healthScore: 100,
      }),
    } as unknown as ParserService;

    dedupService = {
      isDuplicate: vi.fn().mockResolvedValue(false),
    } as unknown as DedupService;

    currencyService = {
      detectCurrency: vi.fn().mockReturnValue('INR'),
      convertToBase: vi.fn().mockResolvedValue(100),
    } as unknown as CurrencyService;

    classificationService = {
      classify: vi.fn().mockResolvedValue({
        categoryId: 'cat123',
        confidence: 0.9,
        reason: 'LLM_CLASSIFIED',
        tags: [],
      }),
    } as unknown as ClassificationService;

    processor = new PipelineProcessor(
      prisma,
      maskingService,
      parserService,
      dedupService,
      currencyService,
      classificationService,
    );
  });

  it('should process job correctly', async () => {
    const job = { data: { uploadId: 'upload123' } } as Job;
    await processor.process(job);

    expect(prisma.statementUpload.findUnique).toHaveBeenCalled();
    expect(maskingService.mask).toHaveBeenCalled();
    expect(parserService.parse).toHaveBeenCalled();
    expect(dedupService.isDuplicate).toHaveBeenCalled();
    expect(currencyService.convertToBase).toHaveBeenCalled();
    expect(classificationService.classify).toHaveBeenCalled();
    expect(prisma.transaction.create).toHaveBeenCalled();
    expect(prisma.statementUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload123' },
      data: { parseStatus: 'COMPLETED', healthScore: 100 },
    });
  });
});
