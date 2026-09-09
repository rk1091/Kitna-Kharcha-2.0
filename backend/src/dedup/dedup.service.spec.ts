import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DedupService } from './dedup.service';
import { FingerprintService } from './fingerprint/fingerprint.service';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, Direction, Prisma } from '@prisma/client';

describe('DedupService', () => {
  let dedupService: DedupService;
  let fingerprintService: FingerprintService;
  let prismaService: PrismaService;

  beforeEach(() => {
    fingerprintService = new FingerprintService();
    prismaService = {
      transaction: {
        findFirst: vi.fn(),
      },
    } as unknown as PrismaService;
    dedupService = new DedupService(fingerprintService, prismaService);
  });

  it('should return true if transaction is duplicate', async () => {
    const txn: Partial<Transaction> = {
      txnDate: new Date(),
      amountSigned: 100 as unknown as Prisma.Decimal,
      direction: Direction.DEBIT,
      description: 'Test Txn',
    };
    
    const fingerprint = fingerprintService.generate(txn);

    vi.spyOn(prismaService.transaction, 'findFirst').mockResolvedValue({ id: 'existing-id' } as unknown as Transaction);

    const isDup = await dedupService.isDuplicate(txn, 'user-123');

    expect(isDup).toBe(true);
    expect(prismaService.transaction.findFirst).toHaveBeenCalledWith({
      where: {
        fingerprint,
        statement: {
          userId: 'user-123',
        },
      },
    });
  });

  it('should return false if transaction is not duplicate', async () => {
    const txn: Partial<Transaction> = {
      txnDate: new Date(),
      amountSigned: 200 as unknown as Prisma.Decimal,
      direction: Direction.CREDIT,
      description: 'Another Txn',
    };

    vi.spyOn(prismaService.transaction, 'findFirst').mockResolvedValue(null);

    const isDup = await dedupService.isDuplicate(txn, 'user-456', 'account-789');

    expect(isDup).toBe(false);
    expect(prismaService.transaction.findFirst).toHaveBeenCalledWith({
      where: {
        fingerprint: fingerprintService.generate(txn),
        statement: {
          userId: 'user-456',
          // If we add accountId logic, we test it. Since there's no accountId field, maybe it maps to bankName or we ignore it.
          // The prompt says "queries PrismaService to see if a transaction with that fingerprint already exists for that user/account"
          // We will map accountId to bankName if provided, just to be safe, or just ignore it if we don't implement it. Let's map it to bankName.
          bankName: 'account-789',
        },
      },
    });
  });
});
