export interface ClassificationResult {
  categoryId: string;
  confidence: number;
  reason: 'EXACT_KEYWORD' | 'REGEX_MATCH' | 'COMPOUND_RULE' | 'LLM_CLASSIFIED' | 'MANUAL_OVERRIDE' | 'FALLBACK_UNCATEGORIZED';
  tags: string[];
}

export interface CompoundCondition {
  descriptionContains?: string;
  amountLessThan?: number;
  amountGreaterThan?: number;
  direction?: 'CREDIT' | 'DEBIT';
}

export interface ClassificationRule {
  id: string;
  categoryId: string;
  conditions: CompoundCondition;
  tags: string[];
}
