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

  async classifyBatch(
    txns: Transaction[],
    rules: ClassificationRule[],
    categories: Category[],
  ): Promise<ClassificationResult[]> {
    if (!txns || txns.length === 0) return [];

    const results: ClassificationResult[] = new Array(txns.length);
    const unclassified: Array<{ index: number; txn: Transaction }> = [];

    // Phase 1: Local Rule Engine (0 LLM tokens, instantaneous)
    for (let i = 0; i < txns.length; i++) {
      const ruleResult = this.ruleEngineService.evaluate(rules, txns[i]);
      if (ruleResult) {
        results[i] = ruleResult;
      } else {
        unclassified.push({ index: i, txn: txns[i] });
      }
    }

    // Phase 2: Batch LLM classification for all unclassified transactions in 1 call
    if (unclassified.length > 0) {
      const unclassifiedTxns = unclassified.map((u) => u.txn);
      const llmResults = await this.llmClassifierService.classifyBatch(unclassifiedTxns, categories);
      for (let j = 0; j < unclassified.length; j++) {
        const origIndex = unclassified[j].index;
        results[origIndex] = llmResults[j] || {
          categoryId: '',
          confidence: 0,
          reason: 'FALLBACK_UNCATEGORIZED',
          tags: [],
        };
      }
    }

    return results;
  }
}
