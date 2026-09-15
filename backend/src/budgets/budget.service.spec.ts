import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetService } from './budget.service';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetPeriod } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('BudgetService', () => {
  let service: BudgetService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      budget: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: {
        findMany: vi.fn(),
      },
      transaction: {
        findMany: vi.fn(),
      },
    };

    service = new BudgetService(prismaMock as unknown as PrismaService);
  });

  it('should assert 85% utilization status and warning flag for ₹8,500 spend against ₹10,000 budget', async () => {
    prismaMock.budget.findMany.mockResolvedValue([
      {
        id: 'b-1',
        userId: 'user-1',
        categoryId: 'cat-food',
        amount: 10000,
        period: BudgetPeriod.MONTHLY,
        isActive: true,
      },
    ]);

    prismaMock.category.findMany.mockResolvedValue([
      { id: 'cat-food', name: 'Food & Dining' },
    ]);

    prismaMock.transaction.findMany.mockResolvedValue([
      { amountSigned: -8500, direction: 'DEBIT' },
    ]);

    const result = await service.getBudgets('user-1');
    expect(result.budgets).toHaveLength(1);
    const item = result.budgets[0];

    expect(item.limit).toBe(10000);
    expect(item.currentSpend).toBe(8500);
    expect(item.percentageConsumed).toBe(85);
    expect(item.remaining).toBe(1500);
    expect(item.isWarning).toBe(true);
    expect(item.isOverBudget).toBe(false);
    expect(result.summary.warningCount).toBe(1);
    expect(result.summary.overBudgetCount).toBe(0);
  });

  it('should flag as over budget when spend exceeds limit', async () => {
    prismaMock.budget.findMany.mockResolvedValue([
      {
        id: 'b-2',
        userId: 'user-1',
        categoryId: 'cat-shop',
        amount: 5000,
        period: BudgetPeriod.MONTHLY,
        isActive: true,
      },
    ]);

    prismaMock.category.findMany.mockResolvedValue([
      { id: 'cat-shop', name: 'Shopping' },
    ]);

    prismaMock.transaction.findMany.mockResolvedValue([
      { amountSigned: -6200, direction: 'DEBIT' },
    ]);

    const result = await service.getBudgets('user-1');
    const item = result.budgets[0];

    expect(item.percentageConsumed).toBe(124);
    expect(item.isOverBudget).toBe(true);
    expect(item.isWarning).toBe(false);
    expect(result.summary.overBudgetCount).toBe(1);
  });

  it('should create or upsert a budget', async () => {
    prismaMock.budget.upsert.mockResolvedValue({
      id: 'b-new',
      userId: 'user-1',
      categoryId: 'cat-util',
      amount: 4000,
      period: BudgetPeriod.MONTHLY,
      isActive: true,
    });

    const created = await service.createBudget('user-1', {
      categoryId: 'cat-util',
      amount: 4000,
    });

    expect(prismaMock.budget.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          userId: 'user-1',
          categoryId: 'cat-util',
          amount: 4000,
        }),
      }),
    );
    expect(created.amount).toBe(4000);
  });

  it('should update and delete budget with ownership validation', async () => {
    prismaMock.budget.findFirst.mockResolvedValue({
      id: 'b-1',
      userId: 'user-1',
    });
    prismaMock.budget.update.mockResolvedValue({
      id: 'b-1',
      amount: 12000,
    });
    prismaMock.budget.delete.mockResolvedValue({ id: 'b-1' });

    const updated = await service.updateBudget('user-1', 'b-1', { amount: 12000 });
    expect(updated.amount).toBe(12000);

    const deleted = await service.deleteBudget('user-1', 'b-1');
    expect(deleted.id).toBe('b-1');
  });

  it('should throw NotFoundException on invalid budget update', async () => {
    prismaMock.budget.findFirst.mockResolvedValue(null);

    await expect(service.updateBudget('user-1', 'bad-id', { amount: 500 })).rejects.toThrow(NotFoundException);
  });

  it('should generate budget status alerts', async () => {
    prismaMock.budget.findMany.mockResolvedValue([
      {
        id: 'b-1',
        userId: 'user-1',
        categoryId: 'cat-food',
        amount: 10000,
        period: BudgetPeriod.MONTHLY,
        isActive: true,
      },
    ]);
    prismaMock.category.findMany.mockResolvedValue([{ id: 'cat-food', name: 'Food' }]);
    prismaMock.transaction.findMany.mockResolvedValue([{ amountSigned: -9000, direction: 'DEBIT' }]);

    const status = await service.getBudgetStatus('user-1');
    expect(status.alerts).toHaveLength(1);
    expect(status.alerts[0].type).toBe('WARNING');
    expect(status.alerts[0].percentage).toBe(90);
  });
});
