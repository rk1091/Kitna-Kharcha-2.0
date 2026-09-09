import { describe, it, expect, beforeEach } from 'vitest';
import { FingerprintService } from './fingerprint.service';
import { Transaction, Direction, Prisma } from '@prisma/client';

describe('FingerprintService', () => {
  let service: FingerprintService;

  beforeEach(() => {
    service = new FingerprintService();
  });

  it('should generate a deterministic SHA-256 hash', () => {
    const txn: Partial<Transaction> = {
      txnDate: new Date('2023-10-01T10:00:00Z'),
      amountSigned: 150.50 as unknown as Prisma.Decimal, // using Decimal compatibility in test
      direction: Direction.DEBIT,
      description: ' Amazon Web Services ',
    };

    const hash1 = service.generate(txn);
    const hash2 = service.generate({
      ...txn,
      description: 'AMAZON-WEB-SERVICES !@#',
    });

    expect(hash1).toBeDefined();
    expect(hash1).toHaveLength(64); // SHA-256 hex is 64 chars
    expect(hash1).toStrictEqual(hash2); // description is normalized
  });

  it('should produce different hashes for different amounts', () => {
    const txn: Partial<Transaction> = {
      txnDate: new Date('2023-10-01T10:00:00Z'),
      amountSigned: 150.50 as unknown as Prisma.Decimal,
      direction: Direction.DEBIT,
      description: 'Test',
    };

    const hash1 = service.generate(txn);
    const hash2 = service.generate({ ...txn, amountSigned: 150.51 as unknown as Prisma.Decimal });
    expect(hash1).not.toStrictEqual(hash2);
  });
});
