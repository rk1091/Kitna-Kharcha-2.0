import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlmTrackerService, calculateLlmCost } from './llm-tracker.service';

describe('LlmTrackerService', () => {
  let service: LlmTrackerService;
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      llmLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        aggregate: vi.fn(),
      },
    };
    service = new LlmTrackerService(mockPrisma);
  });

  describe('calculateLlmCost', () => {
    it('calculates cost for flash models accurately', () => {
      // 100,000 prompt tokens @ $0.075/1M = $0.0075
      // 50,000 completion tokens @ $0.30/1M = $0.015
      // Total = $0.0225
      const cost = calculateLlmCost('gemini-2.5-flash', 100_000, 50_000);
      expect(cost).toBeCloseTo(0.0225, 6);
    });

    it('calculates cost for pro models accurately', () => {
      // 10,000 prompt tokens @ $1.25/1M = $0.0125
      // 5,000 completion tokens @ $5.00/1M = $0.025
      // Total = $0.0375
      const cost = calculateLlmCost('gemini-1.5-pro', 10_000, 5_000);
      expect(cost).toBeCloseTo(0.0375, 6);
    });
  });

  describe('recordLog', () => {
    it('persists log with calculated cost and token metrics', async () => {
      mockPrisma.llmLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.recordLog({
        userId: 'user-123',
        operation: 'categorize',
        model: 'gemini-2.5-flash',
        promptTokens: 200,
        completionTokens: 50,
        latencyMs: 340,
        toolCalls: [{ name: 'get_transactions', arguments: {} }],
        isSuccess: true,
      });

      expect(mockPrisma.llmLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          operation: 'categorize',
          model: 'gemini-2.5-flash',
          promptTokens: 200,
          completionTokens: 50,
          totalTokens: 250,
          latencyMs: 340,
          isSuccess: true,
          toolCalls: JSON.stringify([{ name: 'get_transactions', arguments: {} }]),
        }),
      });
      expect(result).toEqual({ id: 'log-1' });
    });

    it('handles database errors without throwing', async () => {
      mockPrisma.llmLog.create.mockRejectedValue(new Error('DB connection failed'));

      const result = await service.recordLog({
        operation: 'copilot',
        model: 'gemini-2.5-flash',
        latencyMs: 120,
      });

      expect(result).toBeNull();
    });

    it('works when prisma is undefined (e.g. offline/standalone)', async () => {
      const standaloneService = new LlmTrackerService(undefined);
      const result = await standaloneService.recordLog({
        operation: 'test',
        model: 'gemini-2.5-flash',
        latencyMs: 50,
      });

      expect(result).toBeNull();
    });
  });

  describe('getUsageSummary', () => {
    it('returns aggregated metrics and breakdown', async () => {
      mockPrisma.llmLog.findMany
        .mockResolvedValueOnce([
          {
            id: 'log-1',
            userId: 'user-1',
            operation: 'categorize',
            model: 'gemini-2.5-flash',
            promptTokens: 100,
            completionTokens: 20,
            totalTokens: 120,
            latencyMs: 250,
            estimatedCostUsd: 0.00001,
            toolCalls: null,
            isSuccess: true,
            errorMessage: null,
            createdAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          { model: 'gemini-2.5-flash', operation: 'categorize', isSuccess: true },
          { model: 'gemini-2.5-flash', operation: 'copilot', isSuccess: false },
        ]);

      mockPrisma.llmLog.aggregate.mockResolvedValue({
        _count: { id: 2 },
        _sum: {
          promptTokens: 200,
          completionTokens: 40,
          totalTokens: 240,
          estimatedCostUsd: 0.00002,
          latencyMs: 500,
        },
        _avg: {
          latencyMs: 250,
        },
      });

      const summary = await service.getUsageSummary('user-1');

      expect(summary.totalCalls).toBe(2);
      expect(summary.successfulCalls).toBe(1);
      expect(summary.failedCalls).toBe(1);
      expect(summary.totalTokens).toBe(240);
      expect(summary.avgLatencyMs).toBe(250);
      expect(summary.callsByModel['gemini-2.5-flash']).toBe(2);
      expect(summary.callsByOperation['categorize']).toBe(1);
      expect(summary.callsByOperation['copilot']).toBe(1);
      expect(summary.recentLogs).toHaveLength(1);
    });
  });
});
