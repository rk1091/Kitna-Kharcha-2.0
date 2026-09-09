import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngineService } from './rule-engine.service';
import { Transaction } from '@prisma/client';
import { ClassificationRule } from '../interfaces/classification.interface';

describe('RuleEngineService', () => {
  let service: RuleEngineService;

  beforeEach(() => {
    service = new RuleEngineService();
  });

  it('should match description', () => {
    const rules: ClassificationRule[] = [
      {
        id: '1',
        categoryId: 'cat1',
        conditions: { descriptionContains: 'zomato' },
        tags: ['food']
      }
    ];
    const txn = { description: 'ZOMATO ORDER', amountSigned: -200, direction: 'DEBIT' } as unknown as Transaction;
    const result = service.evaluate(rules, txn);
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('cat1');
    expect(result?.reason).toBe('COMPOUND_RULE');
    expect(result?.confidence).toBe(1.0);
    expect(result?.tags).toEqual(['food']);
  });

  it('should fail if description does not match', () => {
    const rules: ClassificationRule[] = [{ id: '1', categoryId: 'cat1', conditions: { descriptionContains: 'swiggy' }, tags: [] }];
    const txn = { description: 'ZOMATO ORDER', amountSigned: -200, direction: 'DEBIT' } as unknown as Transaction;
    expect(service.evaluate(rules, txn)).toBeNull();
  });

  it('should match multiple conditions', () => {
    const rules: ClassificationRule[] = [
      { id: '1', categoryId: 'cat1', conditions: { descriptionContains: 'zomato', amountLessThan: 500, direction: 'DEBIT' }, tags: [] }
    ];
    const txn = { description: 'zomato', amountSigned: -400, direction: 'DEBIT' } as unknown as Transaction;
    expect(service.evaluate(rules, txn)).not.toBeNull();
  });

  it('should fail if one of multiple conditions fails (amount > expected)', () => {
    const rules: ClassificationRule[] = [
      { id: '1', categoryId: 'cat1', conditions: { descriptionContains: 'zomato', amountLessThan: 300 }, tags: [] }
    ];
    const txn = { description: 'zomato', amountSigned: -400, direction: 'DEBIT' } as unknown as Transaction;
    expect(service.evaluate(rules, txn)).toBeNull();
  });

  it('should match amountGreaterThan', () => {
    const rules: ClassificationRule[] = [
      { id: '1', categoryId: 'cat1', conditions: { amountGreaterThan: 1000 }, tags: [] }
    ];
    const txn = { description: 'rent', amountSigned: -1500, direction: 'DEBIT' } as unknown as Transaction;
    expect(service.evaluate(rules, txn)).not.toBeNull();
  });
});
