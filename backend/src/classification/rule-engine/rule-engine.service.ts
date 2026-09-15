import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { ClassificationRule, ClassificationResult, CompoundCondition } from '../interfaces/classification.interface';

@Injectable()
export class RuleEngineService {
  evaluate(rules: ClassificationRule[], txn: Transaction): ClassificationResult | null {
    // Sort rules by priority descending (higher priority evaluated first)
    const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const rule of sortedRules) {
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

  private parseConditions(conditions: CompoundCondition | string | undefined | null): CompoundCondition | null {
    if (!conditions) return null;
    if (typeof conditions === 'string') {
      try {
        const parsed = JSON.parse(conditions);
        if (typeof parsed !== 'object' || parsed === null) return null;
        return parsed;
      } catch {
        return null;
      }
    }
    return conditions;
  }

  private matches(rule: ClassificationRule, txn: Transaction): boolean {
    const conditions = this.parseConditions(rule.conditions);
    if (!conditions) return false;

    // Check description / keyword / normalized merchant
    const desc = (txn.description || '').toLowerCase();
    const normalizedDesc = ((txn as any).normalizedDescription || '').toLowerCase();

    // 1. descriptionContains: matches against raw description OR normalizedDescription
    if (conditions.descriptionContains) {
      const target = conditions.descriptionContains.toLowerCase();
      if (!desc.includes(target) && !normalizedDesc.includes(target)) {
        return false;
      }
    }

    // 2. keyword: matches against raw description OR normalizedDescription (for legacy/seed rules)
    if (conditions.keyword) {
      const target = conditions.keyword.toLowerCase();
      if (!desc.includes(target) && !normalizedDesc.includes(target)) {
        return false;
      }
    }

    // 3. normalizedMerchantContains: matches against normalizedDescription
    if (conditions.normalizedMerchantContains) {
      const target = conditions.normalizedMerchantContains.toLowerCase();
      if (!normalizedDesc.includes(target)) {
        return false;
      }
    }

    // 4. Amount conditions
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

    // 5. Direction condition
    if (conditions.direction) {
      if (txn.direction !== conditions.direction) {
        return false;
      }
    }

    // 6. Day of week condition (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    if (conditions.dayOfWeek !== undefined) {
      if (!txn.txnDate) {
        return false;
      }
      const txnDay = new Date(txn.txnDate).getDay();
      if (txnDay !== conditions.dayOfWeek) {
        return false;
      }
    }

    return true;
  }
}
