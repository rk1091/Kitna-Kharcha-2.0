import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackService } from './feedback.service';
import { Transaction } from '@prisma/client';

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    service = new FeedbackService();
  });

  it('should suggest a rule based on transaction description', () => {
    const txn = {
      description: 'Zomato order 123',
      direction: 'DEBIT',
    } as unknown as Transaction;

    const rule = service.suggestRule(txn, 'cat-food');

    expect(rule.categoryId).toBe('cat-food');
    expect(rule.conditions.descriptionContains).toBe('zomato');
    expect(rule.conditions.direction).toBe('DEBIT');
  });
  
  it('should handle short descriptions', () => {
    const txn = {
      description: 'Fee',
      direction: 'DEBIT',
    } as unknown as Transaction;

    const rule = service.suggestRule(txn, 'cat-fee');
    expect(rule.conditions.descriptionContains).toBe('fee');
  });
});
