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

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
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
