import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PassportModule } from '@nestjs/passport';
import { TransactionsController } from '../src/transactions/transactions.controller';
import { TransactionsService } from '../src/transactions/transactions.service';
import { ExportController } from '../src/export/export.controller';
import { ExportService } from '../src/export/export.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { CopilotController } from '../src/copilot/copilot.controller';
import { CopilotService } from '../src/copilot/copilot.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E - Reject Unauthenticated Endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [
        TransactionsController,
        ExportController,
        AuthController,
        CopilotController,
      ],
      providers: [
        { provide: TransactionsService, useValue: {} },
        { provide: ExportService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: CopilotService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        JwtStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /transactions should reject unauthenticated request with 401', async () => {
    const res = await request(app.getHttpServer()).get('/transactions');
    expect(res.status).toBe(401);
  });

  describe('Export Endpoints', () => {
    it('GET /export/csv should reject unauthenticated request with 401', async () => {
      const res = await request(app.getHttpServer()).get('/export/csv');
      expect(res.status).toBe(401);
    });

    it('GET /export/excel should reject unauthenticated request with 401', async () => {
      const res = await request(app.getHttpServer()).get('/export/excel');
      expect(res.status).toBe(401);
    });

    it('GET /export/report should reject unauthenticated request with 401', async () => {
      const res = await request(app.getHttpServer()).get('/export/report');
      expect(res.status).toBe(401);
    });
  });

  it('POST /auth/clear-data should reject unauthenticated request with 401', async () => {
    const res = await request(app.getHttpServer()).post('/auth/clear-data');
    expect(res.status).toBe(401);
  });

  it('GET /auth/export-json should reject unauthenticated request with 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/export-json');
    expect(res.status).toBe(401);
  });

  it('POST /copilot/ask should reject unauthenticated request with 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/copilot/ask')
      .send({ question: 'How much did I spend?' });
    expect(res.status).toBe(401);
  });
});
