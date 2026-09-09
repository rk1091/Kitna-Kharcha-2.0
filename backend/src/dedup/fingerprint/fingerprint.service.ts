import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class FingerprintService {
  generate(transaction: Partial<Transaction>): string {
    const { txnDate, amountSigned, debitAmount, creditAmount, direction, description } = transaction;
    
    const dateStr = txnDate ? new Date(txnDate as Date | string).toISOString() : '';
    
    const amount = amountSigned ? amountSigned.toString() : (debitAmount || creditAmount || '').toString();
    
    const normalizedDesc = (description || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const payload = `${dateStr}|${amount}|${direction || ''}|${normalizedDesc}`;

    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
