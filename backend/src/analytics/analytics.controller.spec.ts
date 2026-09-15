import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getTrends: vi.fn(),
      getMerchantVelocity: vi.fn(),
    };

    controller = new AnalyticsController(serviceMock as unknown as AnalyticsService);
  });

  it('should call getTrends with userId and months', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getTrends.mockResolvedValue({ monthlyTrends: [] });

    await controller.getTrends(req, '12');
    expect(serviceMock.getTrends).toHaveBeenCalledWith('user-1', 12);
  });

  it('should call getMerchantVelocity with userId and top limit', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getMerchantVelocity.mockResolvedValue([]);

    await controller.getMerchantVelocity(req, '5');
    expect(serviceMock.getMerchantVelocity).toHaveBeenCalledWith('user-1', 5);
  });
});
