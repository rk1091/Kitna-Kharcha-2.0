import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'statements' })
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
