import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      transaction: {
        findMany: vi.fn(),
      },
    };

    service = new AnalyticsService(prismaMock as unknown as PrismaService);
  });

  it('should compute monthly buckets, category velocities, and income stability', async () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 10);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10);

    const mockTxns = [
      {
        txnDate: thisMonth,
        amountSigned: -4500,
        direction: 'DEBIT',
        categoryId: 'cat-food',
        category: { name: 'Food' },
      },
      {
        txnDate: lastMonth,
        amountSigned: -3000,
        direction: 'DEBIT',
        categoryId: 'cat-food',
        category: { name: 'Food' },
      },
      {
        txnDate: thisMonth,
        amountSigned: 75000,
        direction: 'CREDIT',
        description: 'Salary Credit',
      },
      {
        txnDate: lastMonth,
        amountSigned: 75000,
        direction: 'CREDIT',
        description: 'Salary Credit',
      },
    ];

    prismaMock.transaction.findMany.mockResolvedValue(mockTxns);

    const result = await service.getTrends('user-1', 6);
    expect(result.monthlyTrends).toHaveLength(6);
    expect(result.categoryVelocities.length).toBeGreaterThanOrEqual(1);

    const foodVelocity = result.categoryVelocities.find(c => c.categoryId === 'cat-food');
    expect(foodVelocity).toBeDefined();
    expect(foodVelocity?.averageMonthly).toBeGreaterThan(0);

    expect(result.incomeStability).toBeDefined();
    expect(result.incomeStability.averageSalary).toBe(75000);
    expect(result.incomeStability.score).toBeGreaterThanOrEqual(70);
  });

  it('should compute merchant velocity trajectories', async () => {
    const now = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(now.getDate() - 15);
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(now.getDate() - 40);

    const mockTxns = [
      // Swiggy spend increased from 1000 to 2500 (surging)
      { txnDate: fifteenDaysAgo, normalizedDescription: 'Swiggy', amountSigned: -2500, direction: 'DEBIT' },
      { txnDate: fortyDaysAgo, normalizedDescription: 'Swiggy', amountSigned: -1000, direction: 'DEBIT' },
      // Netflix new spend 649 (new)
      { txnDate: fifteenDaysAgo, normalizedDescription: 'Netflix', amountSigned: -649, direction: 'DEBIT' },
    ];

    prismaMock.transaction.findMany.mockResolvedValue(mockTxns);

    const velocities = await service.getMerchantVelocity('user-1');
    expect(velocities.length).toBeGreaterThanOrEqual(2);

    const swiggy = velocities.find(v => v.merchant === 'Swiggy');
    expect(swiggy).toBeDefined();
    expect(swiggy?.currentPeriodSpend).toBe(2500);
    expect(swiggy?.previousPeriodSpend).toBe(1000);
    expect(swiggy?.deltaAmount).toBe(1500);
    expect(swiggy?.trajectory).toBe('SURGING');

    const netflix = velocities.find(v => v.merchant === 'Netflix');
    expect(netflix).toBeDefined();
    expect(netflix?.trajectory).toBe('NEW');
  });
});
