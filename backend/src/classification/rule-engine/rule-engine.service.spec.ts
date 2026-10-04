import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngineService } from './rule-engine.service';
import { Transaction } from '@prisma/client';
import { ClassificationRule } from '../interfaces/classification.interface';

describe('RuleEngineService', () => {
  let service: RuleEngineService;

  beforeEach(() => {
    service = new RuleEngineService();
  });

  describe('Basic Description & Amount Conditions', () => {
    it('should match description', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat1',
          conditions: { descriptionContains: 'zomato' },
          tags: ['food'],
        },
      ];
      const txn = {
        description: 'ZOMATO ORDER',
        amountSigned: -200,
        direction: 'DEBIT',
      } as unknown as Transaction;
      const result = service.evaluate(rules, txn);
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('cat1');
      expect(result?.reason).toBe('COMPOUND_RULE');
      expect(result?.confidence).toBe(1.0);
      expect(result?.tags).toEqual(['food']);
    });

    it('should fail if description does not match', () => {
      const rules: ClassificationRule[] = [
        { id: '1', categoryId: 'cat1', conditions: { descriptionContains: 'swiggy' }, tags: [] },
      ];
      const txn = {
        description: 'ZOMATO ORDER',
        amountSigned: -200,
        direction: 'DEBIT',
      } as unknown as Transaction;
      expect(service.evaluate(rules, txn)).toBeNull();
    });

    it('should match multiple conditions', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat1',
          conditions: { descriptionContains: 'zomato', amountLessThan: 500, direction: 'DEBIT' },
          tags: [],
        },
      ];
      const txn = {
        description: 'zomato',
        amountSigned: -400,
        direction: 'DEBIT',
      } as unknown as Transaction;
      expect(service.evaluate(rules, txn)).not.toBeNull();
    });

    it('should fail if one of multiple conditions fails (amount > expected)', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat1',
          conditions: { descriptionContains: 'zomato', amountLessThan: 300 },
          tags: [],
        },
      ];
      const txn = {
        description: 'zomato',
        amountSigned: -400,
        direction: 'DEBIT',
      } as unknown as Transaction;
      expect(service.evaluate(rules, txn)).toBeNull();
    });

    it('should match amountGreaterThan', () => {
      const rules: ClassificationRule[] = [
        { id: '1', categoryId: 'cat1', conditions: { amountGreaterThan: 1000 }, tags: [] },
      ];
      const txn = {
        description: 'rent',
        amountSigned: -1500,
        direction: 'DEBIT',
      } as unknown as Transaction;
      expect(service.evaluate(rules, txn)).not.toBeNull();
    });
  });

  describe('Merchant & Normalized Description Matching', () => {
    it('should match normalizedMerchantContains against normalizedDescription', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-food',
          conditions: { normalizedMerchantContains: 'Swiggy' },
          tags: ['food', 'delivery'],
        },
      ];
      const txn = {
        description: 'UPI/P2M/92834928/BUNDL TECH/092',
        normalizedDescription: 'Swiggy',
        amountSigned: -350,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-food');
      expect(result?.tags).toEqual(['food', 'delivery']);
    });

    it('should match descriptionContains against normalizedDescription if raw description does not match', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-transport',
          conditions: { descriptionContains: 'Uber' },
          tags: ['transport'],
        },
      ];
      const txn = {
        description: 'UPI/12345/ANI/OTH',
        normalizedDescription: 'Uber',
        amountSigned: -180,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-transport');
    });

    it('should support legacy and seed keyword condition', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-food',
          conditions: { keyword: 'Zomato' },
          tags: ['dining'],
        },
      ];
      const txn = {
        description: 'UPI/P2M/1234/ZOMATO/09',
        normalizedDescription: 'Zomato',
        amountSigned: -250,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-food');
    });
  });

  describe('Day of Week Condition', () => {
    it('should match when transaction day of week matches condition (e.g. Sunday = 0)', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-weekend',
          conditions: { descriptionContains: 'Movie', dayOfWeek: 0 }, // 0 = Sunday
          tags: ['entertainment'],
        },
      ];
      // 2026-09-13 was a Sunday
      const txn = {
        description: 'Movie Tickets PVR',
        txnDate: new Date('2026-09-13T18:00:00.000Z'),
        amountSigned: -800,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-weekend');
    });

    it('should fail when transaction day of week does not match condition', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-weekend',
          conditions: { descriptionContains: 'Movie', dayOfWeek: 0 }, // Sunday
          tags: [],
        },
      ];
      // 2026-09-15 is a Tuesday (day 2)
      const txn = {
        description: 'Movie Tickets PVR',
        txnDate: new Date('2026-09-15T18:00:00.000Z'),
        amountSigned: -800,
        direction: 'DEBIT',
      } as unknown as Transaction;

      expect(service.evaluate(rules, txn)).toBeNull();
    });
  });

  describe('JSON String Parsing & Robustness', () => {
    it('should correctly evaluate rule when conditions are stored as serialized JSON string', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-sub',
          conditions: JSON.stringify({ descriptionContains: 'netflix', direction: 'DEBIT' }),
          tags: ['streaming'],
        },
      ];
      const txn = {
        description: 'NETFLIX.COM',
        normalizedDescription: 'Netflix',
        amountSigned: -649,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-sub');
    });

    it('should handle corrupted JSON string conditions gracefully without throwing', () => {
      const rules: ClassificationRule[] = [
        {
          id: '1',
          categoryId: 'cat-sub',
          conditions: '{invalid-json' as unknown as string,
          tags: [],
        },
      ];
      const txn = {
        description: 'Any Txn',
        amountSigned: -100,
        direction: 'DEBIT',
      } as unknown as Transaction;

      expect(service.evaluate(rules, txn)).toBeNull();
    });
  });

  describe('Rule Priority Ordering', () => {
    it('should evaluate higher priority rules first', () => {
      const rules: ClassificationRule[] = [
        {
          id: 'low-prio',
          categoryId: 'cat-generic-shopping',
          conditions: { descriptionContains: 'Amazon' },
          priority: 1,
          tags: ['shopping'],
        },
        {
          id: 'high-prio',
          categoryId: 'cat-amazon-pay-bill',
          conditions: { descriptionContains: 'Amazon', amountGreaterThan: 1000 },
          priority: 10,
          tags: ['bills'],
        },
      ];

      const txn = {
        description: 'Amazon Pay Bill Desk',
        normalizedDescription: 'Amazon',
        amountSigned: -2500,
        direction: 'DEBIT',
      } as unknown as Transaction;

      const result = service.evaluate(rules, txn);
      expect(result?.categoryId).toBe('cat-amazon-pay-bill');
      expect(result?.tags).toEqual(['bills']);
    });
  });

  describe('Auto-Learned & Flexible Substring Conditions', () => {
    it('should match auto-learned rules using field/operator/value case-insensitively', () => {
      const rules = [
        {
          id: 'auto-1',
          categoryId: 'cat-food',
          conditions: { field: 'normalizedDescription', operator: 'equals', value: 'Swiggy' },
          tags: ['food'],
        },
      ];
      const txn = {
        description: ': RAZ*SwiggyBangalore C',
        normalizedDescription: 'Swiggy',
        amountSigned: -18,
        direction: 'DEBIT',
      } as any;
      const result = service.evaluate(rules as any, txn);
      expect(result?.categoryId).toBe('cat-food');
    });

    it('should match substring in descriptionContains regardless of prefixes or noise', () => {
      const rules = [
        {
          id: 'auto-2',
          categoryId: 'cat-food',
          conditions: { descriptionContains: 'dineout' },
          tags: ['dining'],
        },
      ];
      const txn = {
        description: ': WWW DINEOUT CO INGURGAON C',
        normalizedDescription: 'Dineout',
        amountSigned: -1200,
        direction: 'DEBIT',
      } as any;
      expect(service.evaluate(rules as any, txn)?.categoryId).toBe('cat-food');
    });

    it('should match Nykaa even if operator is contains or equals with noisy string', () => {
      const rules = [
        {
          id: 'auto-3',
          categoryId: 'cat-shopping',
          conditions: { field: 'normalizedDescription', operator: 'contains', value: 'nykaa' },
          tags: ['shopping'],
        },
      ];
      const txn = {
        description: '00: EMINYKAA VIA SMARTBUYMUMBRA C',
        normalizedDescription: 'Nykaa',
        amountSigned: -3499,
        direction: 'DEBIT',
      } as any;
      expect(service.evaluate(rules as any, txn)?.categoryId).toBe('cat-shopping');
    });

    it('should fail when auto-learned rule value does not match transaction', () => {
      const rules = [
        {
          id: 'auto-4',
          categoryId: 'cat-shopping',
          conditions: { field: 'normalizedDescription', operator: 'equals', value: 'Nykaa' },
          tags: ['shopping'],
        },
      ];
      const txn = {
        description: ': RAZ*SwiggyBangalore C',
        normalizedDescription: 'Swiggy',
        amountSigned: -18,
        direction: 'DEBIT',
      } as any;
      expect(service.evaluate(rules as any, txn)).toBeNull();
    });
  });
});
