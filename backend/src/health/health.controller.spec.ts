import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { HttpStatus } from '@nestjs/common';

// Mock ioredis
const mockPing = vi.fn();
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      connect: mockConnect,
      ping: mockPing,
      disconnect: mockDisconnect,
    })),
  };
});

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrisma: any;
  let mockResponse: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((data) => data),
    };
    controller = new HealthController(mockPrisma);
  });

  describe('liveness', () => {
    it('returns 200 OK with service name and uptime', () => {
      controller.getLiveness(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          service: 'kitna-kharcha-backend',
        })
      );
    });
  });

  describe('readiness', () => {
    it('returns 200 OK when both DB and Redis are up', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockConnect.mockResolvedValue(undefined);
      mockPing.mockResolvedValue('PONG');

      await controller.getReadiness(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          checks: {
            database: 'up',
            redis: 'up',
          },
        })
      );
    });

    it('returns 503 SERVICE_UNAVAILABLE when database is down', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection timeout'));
      mockConnect.mockResolvedValue(undefined);
      mockPing.mockResolvedValue('PONG');

      await controller.getReadiness(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'degraded',
          checks: {
            database: 'down',
            redis: 'up',
          },
        })
      );
    });

    it('returns 503 SERVICE_UNAVAILABLE when redis is down', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockConnect.mockRejectedValue(new Error('Redis connection refused'));

      await controller.getReadiness(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'degraded',
          checks: {
            database: 'up',
            redis: 'down',
          },
        })
      );
    });
  });
});
