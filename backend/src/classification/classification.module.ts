import { Module } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { RuleEngineService } from './rule-engine/rule-engine.service';
import { LLMClassifierService } from './llm-classifier/llm-classifier.service';
import { FeedbackService } from './feedback/feedback.service';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { LLMModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LLMModule, PrismaModule],
  controllers: [RulesController],
  providers: [
    ClassificationService,
    RuleEngineService,
    LLMClassifierService,
    FeedbackService,
    RulesService,
  ],
  exports: [ClassificationService, FeedbackService, RulesService],
})
export class ClassificationModule {}
