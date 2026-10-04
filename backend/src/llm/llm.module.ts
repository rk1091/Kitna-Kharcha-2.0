import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LlmTrackerService } from './observability/llm-tracker.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LLMService, LlmTrackerService],
  exports: [LLMService, LlmTrackerService],
})
export class LLMModule {}
