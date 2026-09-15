import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetPeriod } from '@prisma/client';

describe('BudgetController', () => {
  let controller: BudgetController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getBudgets: vi.fn(),
      getBudgetStatus: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      deleteBudget: vi.fn(),
    };

    controller = new BudgetController(serviceMock as unknown as BudgetService);
  });

  it('should call getBudgets with userId', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getBudgets.mockResolvedValue({ budgets: [], summary: {} });

    await controller.getBudgets(req);
    expect(serviceMock.getBudgets).toHaveBeenCalledWith('user-1');
  });

  it('should call getBudgetStatus with userId', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getBudgetStatus.mockResolvedValue({ summary: {}, alerts: [] });

    await controller.getBudgetStatus(req);
    expect(serviceMock.getBudgetStatus).toHaveBeenCalledWith('user-1');
  });

  it('should call createBudget with payload', async () => {
    const req = { user: { id: 'user-1' } };
    const dto = { categoryId: 'cat-1', amount: 5000, period: BudgetPeriod.MONTHLY };
    serviceMock.createBudget.mockResolvedValue({ id: 'b-1', ...dto });

    const res = await controller.createBudget(req, dto);
    expect(serviceMock.createBudget).toHaveBeenCalledWith('user-1', dto);
    expect(res.id).toBe('b-1');
  });

  it('should call updateBudget with id and payload', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.updateBudget.mockResolvedValue({ id: 'b-1', amount: 6000 });

    const res = await controller.updateBudget(req, 'b-1', { amount: 6000 });
    expect(serviceMock.updateBudget).toHaveBeenCalledWith('user-1', 'b-1', { amount: 6000 });
    expect(res.amount).toBe(6000);
  });

  it('should call deleteBudget with id', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.deleteBudget.mockResolvedValue({ id: 'b-1' });

    await controller.deleteBudget(req, 'b-1');
    expect(serviceMock.deleteBudget).toHaveBeenCalledWith('user-1', 'b-1');
  });
});
