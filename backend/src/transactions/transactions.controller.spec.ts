import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockTransactionsService = {
  getTransactions: vi.fn(),
  getStatementUploads: vi.fn(),
  getCategories: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  bulkCategorize: vi.fn(),
  bulkDelete: vi.fn(),
};

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(() => {
    controller = new TransactionsController(
      mockTransactionsService as unknown as TransactionsService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get transactions with filters', async () => {
    const req = { user: { id: 'u1' } } as any;
    const query = { statementId: 's1', direction: 'DEBIT' as const };
    const expected = [{ id: 't1', amountSigned: -100 }];
    mockTransactionsService.getTransactions.mockResolvedValue(expected);

    const result = await controller.getTransactions(req, query);
    expect(result).toEqual(expected);
    expect(mockTransactionsService.getTransactions).toHaveBeenCalledWith('u1', query);
  });

  it('should get statements', async () => {
    const req = { user: { id: 'u1' } } as any;
    mockTransactionsService.getStatementUploads.mockResolvedValue([{ id: 's1' }]);

    const result = await controller.getStatements(req);
    expect(result).toEqual([{ id: 's1' }]);
    expect(mockTransactionsService.getStatementUploads).toHaveBeenCalledWith('u1');
  });

  it('should get all categories', async () => {
    mockTransactionsService.getCategories.mockResolvedValue([{ id: 'c1', name: 'Food' }]);

    const result = await controller.getCategories();
    expect(result).toEqual([{ id: 'c1', name: 'Food' }]);
    expect(mockTransactionsService.getCategories).toHaveBeenCalled();
  });

  it('should update a transaction', async () => {
    const req = { user: { id: 'u1' } } as any;
    const body = { categoryId: 'c2' };
    mockTransactionsService.updateTransaction.mockResolvedValue({ id: 't1', categoryId: 'c2' });

    const result = await controller.updateTransaction('t1', body, req);
    expect(result).toEqual({ id: 't1', categoryId: 'c2' });
    expect(mockTransactionsService.updateTransaction).toHaveBeenCalledWith('u1', 't1', body);
  });

  it('should delete a transaction', async () => {
    const req = { user: { id: 'u1' } } as any;
    mockTransactionsService.deleteTransaction.mockResolvedValue({ success: true, deletedId: 't1' });

    const result = await controller.deleteTransaction('t1', req);
    expect(result).toEqual({ success: true, deletedId: 't1' });
    expect(mockTransactionsService.deleteTransaction).toHaveBeenCalledWith('u1', 't1');
  });

  it('should bulk categorize transactions', async () => {
    const req = { user: { id: 'u1' } } as any;
    const body = { transactionIds: ['t1', 't2'], categoryId: 'c1' };
    mockTransactionsService.bulkCategorize.mockResolvedValue({ success: true, count: 2 });

    const result = await controller.bulkCategorize(body, req);
    expect(result).toEqual({ success: true, count: 2 });
    expect(mockTransactionsService.bulkCategorize).toHaveBeenCalledWith('u1', ['t1', 't2'], 'c1');
  });

  it('should bulk delete transactions', async () => {
    const req = { user: { id: 'u1' } } as any;
    const body = { transactionIds: ['t1', 't2'] };
    mockTransactionsService.bulkDelete.mockResolvedValue({ success: true, count: 2 });

    const result = await controller.bulkDelete(body, req);
    expect(result).toEqual({ success: true, count: 2 });
    expect(mockTransactionsService.bulkDelete).toHaveBeenCalledWith('u1', ['t1', 't2']);
  });
});
