import { Controller, Get, HttpStatus, Optional, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  @Get('liveness')
  getLiveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'ok',
      service: 'kitna-kharcha-backend',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  @Get('readiness')
  async getReadiness(@Res() res: Response) {
    const checks: { database: 'up' | 'down'; redis: 'up' | 'down' } = {
      database: 'down',
      redis: 'down',
    };

    // 1. Check Database
    try {
      if (this.prisma) {
        await this.prisma.$queryRaw`SELECT 1`;
        checks.database = 'up';
      } else {
        checks.database = 'down';
      }
    } catch {
      checks.database = 'down';
    }

    // 2. Check Redis
    let redisClient: Redis | null = null;
    try {
      const redisUrl = process.env.REDIS_URL;
      redisClient = redisUrl
        ? new Redis(redisUrl, { connectTimeout: 1500, maxRetriesPerRequest: 0, lazyConnect: true })
        : new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            connectTimeout: 1500,
            maxRetriesPerRequest: 0,
            lazyConnect: true,
          });

      await redisClient.connect();
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        checks.redis = 'up';
      }
    } catch {
      checks.redis = 'down';
    } finally {
      if (redisClient) {
        try {
          redisClient.disconnect();
        } catch {}
      }
    }

    const isHealthy = checks.database === 'up' && checks.redis === 'up';
    const statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: isHealthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
}
