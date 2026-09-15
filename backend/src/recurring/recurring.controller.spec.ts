import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecurringController } from './recurring.controller';
import { RecurringService } from './recurring.service';

describe('RecurringController', () => {
  let controller: RecurringController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getRecurring: vi.fn(),
      detectRecurring: vi.fn(),
      toggleRecurring: vi.fn(),
    };

    controller = new RecurringController(serviceMock as unknown as RecurringService);
  });

  it('should call getRecurring with userId', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getRecurring.mockResolvedValue({ groups: [], summary: { totalMonthlyCommitment: 0 } });

    const result = await controller.getRecurring(req);
    expect(serviceMock.getRecurring).toHaveBeenCalledWith('user-1');
    expect(result.summary.totalMonthlyCommitment).toBe(0);
  });

  it('should call detectRecurring with userId', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.detectRecurring.mockResolvedValue({ groups: [] });

    await controller.detectRecurring(req);
    expect(serviceMock.detectRecurring).toHaveBeenCalledWith('user-1');
  });

  it('should call toggleRecurring with userId and group id', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.toggleRecurring.mockResolvedValue({ id: 'rec-1', isActive: false });

    const result = await controller.toggleRecurring(req, 'rec-1');
    expect(serviceMock.toggleRecurring).toHaveBeenCalledWith('user-1', 'rec-1');
    expect(result.isActive).toBe(false);
  });
});
