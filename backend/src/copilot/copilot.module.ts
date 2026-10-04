import { Module } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { LLMModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringModule } from '../recurring/recurring.module';

@Module({
  imports: [LLMModule, PrismaModule, RecurringModule],
  controllers: [CopilotController],
  providers: [CopilotService],
  exports: [CopilotService],
})
export class CopilotModule {}
