import { Module } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { RuleEngineService } from './rule-engine/rule-engine.service';
import { LLMClassifierService } from './llm-classifier/llm-classifier.service';
import { FeedbackService } from './feedback/feedback.service';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [
    ClassificationService,
    RuleEngineService,
    LLMClassifierService,
    FeedbackService,
  ],
  exports: [ClassificationService, FeedbackService],
})
export class ClassificationModule {}
