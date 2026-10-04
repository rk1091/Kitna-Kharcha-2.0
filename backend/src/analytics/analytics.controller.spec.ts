import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { LlmTrackerService } from '../llm/observability/llm-tracker.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let serviceMock: any;
  let trackerMock: any;

  beforeEach(() => {
    serviceMock = {
      getTrends: vi.fn(),
      getMerchantVelocity: vi.fn(),
    };

    trackerMock = {
      getUsageSummary: vi.fn(),
    };

    controller = new AnalyticsController(
      serviceMock as unknown as AnalyticsService,
      trackerMock as unknown as LlmTrackerService,
    );
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

  it('should call getUsageSummary with userId for llm-usage endpoint', async () => {
    const req = { user: { id: 'user-1' } };
    trackerMock.getUsageSummary.mockResolvedValue({ totalCalls: 10 });

    const result = await controller.getLlmUsage(req);
    expect(trackerMock.getUsageSummary).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ totalCalls: 10 });
  });
});
