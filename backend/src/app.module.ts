import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LLMModule } from './llm/llm.module';
import { MaskingModule } from './masking/masking.module';
import { ParserModule } from './parser/parser.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ClassificationModule } from './classification/classification.module';
import { DedupModule } from './dedup/dedup.module';
import { CurrencyModule } from './currency/currency.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CopilotModule } from './copilot/copilot.module';

import { BullModule } from '@nestjs/bullmq';

const redisUrl = process.env.REDIS_URL;

@Module({
  imports: [
    BullModule.forRoot({
      connection: redisUrl
        ? {
            url: redisUrl,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          }
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
    }),
    PrismaModule,
    AuthModule,
    LLMModule,
    MaskingModule,
    ParserModule,
    IngestionModule,
    ClassificationModule,
    DedupModule,
    CurrencyModule,
    PipelineModule,
    TransactionsModule,
    CopilotModule,
  ],
})
export class AppModule {}
