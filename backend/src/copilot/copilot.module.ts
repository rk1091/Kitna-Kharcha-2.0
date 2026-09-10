import { Module } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  controllers: [CopilotController],
  providers: [CopilotService],
})
export class CopilotModule {}
