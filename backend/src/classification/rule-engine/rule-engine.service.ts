import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { ClassificationRule, ClassificationResult } from '../interfaces/classification.interface';

@Injectable()
export class RuleEngineService {
  evaluate(rules: ClassificationRule[], txn: Transaction): ClassificationResult | null {
    for (const rule of rules) {
      if (this.matches(rule, txn)) {
        return {
          categoryId: rule.categoryId,
          confidence: 1.0,
          reason: 'COMPOUND_RULE',
          tags: rule.tags || [],
        };
      }
    }
    return null;
  }

  private matches(rule: ClassificationRule, txn: Transaction): boolean {
    const conditions = rule.conditions;
    if (!conditions) return false;

    if (conditions.descriptionContains) {
      if (!txn.description.toLowerCase().includes(conditions.descriptionContains.toLowerCase())) {
        return false;
      }
    }

    const absAmount = Math.abs(Number(txn.amountSigned));

    if (conditions.amountLessThan !== undefined) {
      if (absAmount >= conditions.amountLessThan) {
        return false;
      }
    }

    if (conditions.amountGreaterThan !== undefined) {
      if (absAmount <= conditions.amountGreaterThan) {
        return false;
      }
    }

    if (conditions.direction) {
      if (txn.direction !== conditions.direction) {
        return false;
      }
    }

    return true;
  }
}
