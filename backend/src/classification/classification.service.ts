import { Injectable } from '@nestjs/common';
import { RuleEngineService } from './rule-engine/rule-engine.service';
import { LLMClassifierService } from './llm-classifier/llm-classifier.service';
import { Transaction, Category } from '@prisma/client';
import { ClassificationRule, ClassificationResult } from './interfaces/classification.interface';

@Injectable()
export class ClassificationService {
  constructor(
    private readonly ruleEngineService: RuleEngineService,
    private readonly llmClassifierService: LLMClassifierService,
  ) {}

  async classify(
    txn: Transaction,
    rules: ClassificationRule[],
    categories: Category[],
  ): Promise<ClassificationResult> {
    const ruleResult = this.ruleEngineService.evaluate(rules, txn);
    if (ruleResult) {
      return ruleResult;
    }

    const llmResult = await this.llmClassifierService.classify(txn, categories);
    if (llmResult) {
      return llmResult;
    }

    return {
      categoryId: '',
      confidence: 0,
      reason: 'FALLBACK_UNCATEGORIZED',
      tags: [],
    };
  }
}
