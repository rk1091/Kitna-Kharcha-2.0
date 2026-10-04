import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

describe('InsightsController', () => {
  let controller: InsightsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getInsightsFeed: vi.fn(),
    };

    controller = new InsightsController(serviceMock as unknown as InsightsService);
  });

  it('should return feed for user', async () => {
    const req = { user: { id: 'user-1' } };
    serviceMock.getInsightsFeed.mockResolvedValue([
      { id: '1', title: 'Test Insight', type: 'SAVINGS_RATE' },
    ]);

    const result = await controller.getInsightsFeed(req);
    expect(serviceMock.getInsightsFeed).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Insight');
  });
});
