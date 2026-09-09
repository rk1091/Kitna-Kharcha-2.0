import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { FingerprintService } from './fingerprint/fingerprint.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DedupService {
  constructor(
    private readonly fingerprintService: FingerprintService,
    private readonly prisma: PrismaService,
  ) {}

  async isDuplicate(transaction: Partial<Transaction>, userId: string, accountId?: string): Promise<boolean> {
    const fingerprint = this.fingerprintService.generate(transaction);

    const statementQuery: Record<string, string> = { userId };
    if (accountId) {
      statementQuery.bankName = accountId;
    }

    const existingTxn = await this.prisma.transaction.findFirst({
      where: {
        fingerprint,
        statement: statementQuery,
      },
    });

    return !!existingTxn;
  }
}
