import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecurringService } from './recurring.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringFreq, RecurringType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('RecurringService', () => {
  let service: RecurringService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      transaction: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
      recurringGroup: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new RecurringService(prismaMock as unknown as PrismaService);
  });

  it('should detect monthly Netflix subscription and link transactions', async () => {
    const mockTxns = [
      {
        id: 'txn-1',
        txnDate: new Date('2026-01-15'),
        debitAmount: 649,
        normalizedDescription: 'Netflix',
        description: 'NETFLIX MUMBAI',
        categoryId: 'cat-ent',
      },
      {
        id: 'txn-2',
        txnDate: new Date('2026-02-14'),
        debitAmount: 649,
        normalizedDescription: 'Netflix',
        description: 'NETFLIX MUMBAI',
        categoryId: 'cat-ent',
      },
      {
        id: 'txn-3',
        txnDate: new Date('2026-03-16'),
        debitAmount: 649,
        normalizedDescription: 'Netflix',
        description: 'NETFLIX MUMBAI',
        categoryId: 'cat-ent',
      },
    ];

    prismaMock.transaction.findMany.mockResolvedValue(mockTxns);
    prismaMock.recurringGroup.findFirst.mockResolvedValue(null);
    prismaMock.recurringGroup.create.mockResolvedValue({
      id: 'rec-1',
      userId: 'user-1',
      merchantId: 'Netflix',
      type: RecurringType.SUBSCRIPTION,
      frequency: RecurringFreq.MONTHLY,
      avgAmount: 649,
      isActive: true,
    });
    prismaMock.recurringGroup.findMany.mockResolvedValue([
      {
        id: 'rec-1',
        userId: 'user-1',
        merchantId: 'Netflix',
        type: RecurringType.SUBSCRIPTION,
        frequency: RecurringFreq.MONTHLY,
        avgAmount: 649,
        isActive: true,
      },
    ]);

    const result = await service.detectRecurring('user-1');

    expect(prismaMock.transaction.findMany).toHaveBeenCalled();
    expect(prismaMock.recurringGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: RecurringType.SUBSCRIPTION,
          frequency: RecurringFreq.MONTHLY,
          avgAmount: 649,
        }),
      }),
    );
    expect(prismaMock.transaction.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['txn-1', 'txn-2', 'txn-3'] } },
      data: { recurringGroupId: 'rec-1' },
    });
    expect(result.summary.activeCount).toBe(1);
    expect(result.summary.totalMonthlyCommitment).toBe(649);
  });

  it('should detect Utility and EMI recurring items', async () => {
    const mockTxns = [
      {
        id: 'txn-1',
        txnDate: new Date('2026-01-05'),
        debitAmount: 2200,
        normalizedDescription: 'Bescom Electricity',
        description: 'BESCOM BILL',
      },
      {
        id: 'txn-2',
        txnDate: new Date('2026-02-04'),
        debitAmount: 2300,
        normalizedDescription: 'Bescom Electricity',
        description: 'BESCOM BILL',
      },
      {
        id: 'txn-3',
        txnDate: new Date('2026-01-10'),
        debitAmount: 15000,
        normalizedDescription: 'HDFC Loan EMI',
        description: 'HDFC LOAN REPAYMENT',
      },
      {
        id: 'txn-4',
        txnDate: new Date('2026-02-10'),
        debitAmount: 15000,
        normalizedDescription: 'HDFC Loan EMI',
        description: 'HDFC LOAN REPAYMENT',
      },
    ];

    prismaMock.transaction.findMany.mockResolvedValue(mockTxns);
    prismaMock.recurringGroup.findFirst.mockResolvedValue(null);
    prismaMock.recurringGroup.create.mockImplementation(({ data }: any) => ({
      id: 'rec-' + data.type,
      ...data,
    }));
    prismaMock.recurringGroup.findMany.mockResolvedValue([]);

    await service.detectRecurring('user-1');

    expect(prismaMock.recurringGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          merchantId: 'Bescom Electricity',
          type: RecurringType.UTILITY,
          frequency: RecurringFreq.MONTHLY,
        }),
      }),
    );
    expect(prismaMock.recurringGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          merchantId: 'HDFC Loan EMI',
          type: RecurringType.EMI,
          frequency: RecurringFreq.MONTHLY,
        }),
      }),
    );
  });

  it('should calculate monthly equivalent commitment across different frequencies', async () => {
    const mockGroups = [
      { id: '1', avgAmount: 1000, frequency: RecurringFreq.WEEKLY, isActive: true },   // 1000 * 4.33 = 4330
      { id: '2', avgAmount: 2000, frequency: RecurringFreq.MONTHLY, isActive: true },  // 2000
      { id: '3', avgAmount: 6000, frequency: RecurringFreq.QUARTERLY, isActive: true },// 2000
      { id: '4', avgAmount: 12000, frequency: RecurringFreq.ANNUAL, isActive: true },  // 1000
      { id: '5', avgAmount: 5000, frequency: RecurringFreq.MONTHLY, isActive: false }, // inactive -> 0
    ];

    prismaMock.recurringGroup.findMany.mockResolvedValue(mockGroups);

    const result = await service.getRecurring('user-1');
    expect(result.summary.activeCount).toBe(4);
    expect(result.summary.totalCount).toBe(5);
    // 4330 + 2000 + 2000 + 1000 = 9330
    expect(result.summary.totalMonthlyCommitment).toBe(9330);
  });

  it('should toggle active status', async () => {
    prismaMock.recurringGroup.findFirst.mockResolvedValue({
      id: 'rec-1',
      userId: 'user-1',
      isActive: true,
    });
    prismaMock.recurringGroup.update.mockResolvedValue({
      id: 'rec-1',
      isActive: false,
    });

    const updated = await service.toggleRecurring('user-1', 'rec-1');
    expect(prismaMock.recurringGroup.update).toHaveBeenCalledWith({
      where: { id: 'rec-1' },
      data: { isActive: false },
    });
    expect(updated.isActive).toBe(false);
  });

  it('should throw NotFoundException if group does not exist when toggling', async () => {
    prismaMock.recurringGroup.findFirst.mockResolvedValue(null);

    await expect(service.toggleRecurring('user-1', 'rec-999')).rejects.toThrow(NotFoundException);
  });
});
