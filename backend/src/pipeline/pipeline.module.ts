import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PipelineService } from './pipeline.service';
import { PipelineProcessor } from './pipeline.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { MaskingModule } from '../masking/masking.module';
import { ParserModule } from '../parser/parser.module';
import { DedupModule } from '../dedup/dedup.module';
import { CurrencyModule } from '../currency/currency.module';
import { ClassificationModule } from '../classification/classification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'statements',
    }),
    PrismaModule,
    MaskingModule,
    ParserModule,
    DedupModule,
    CurrencyModule,
    ClassificationModule,
  ],
  providers: [PipelineService, PipelineProcessor],
  exports: [PipelineService],
})
export class PipelineModule {}
