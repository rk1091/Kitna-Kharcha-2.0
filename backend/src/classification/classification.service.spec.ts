import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClassificationService } from './classification.service';
import { RuleEngineService } from './rule-engine/rule-engine.service';
import { LLMClassifierService } from './llm-classifier/llm-classifier.service';
import { Transaction, Category } from '@prisma/client';
import { ClassificationRule } from './interfaces/classification.interface';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let ruleEngine: RuleEngineService;
  let llmClassifier: LLMClassifierService;

  beforeEach(() => {
    ruleEngine = {
      evaluate: vi.fn(),
    } as unknown as RuleEngineService;

    llmClassifier = {
      classify: vi.fn(),
    } as unknown as LLMClassifierService;

    service = new ClassificationService(ruleEngine, llmClassifier);
  });

  it('should return rule engine result if there is a match', async () => {
    vi.mocked(ruleEngine.evaluate).mockReturnValue({
      categoryId: 'cat1',
      confidence: 1.0,
      reason: 'COMPOUND_RULE',
      tags: [],
    });

    const txn = {} as Transaction;
    const rules = [] as ClassificationRule[];
    const categories = [] as Category[];

    const result = await service.classify(txn, rules, categories);
    
    expect(result.categoryId).toBe('cat1');
    expect(ruleEngine.evaluate).toHaveBeenCalledWith(rules, txn);
    expect(llmClassifier.classify).not.toHaveBeenCalled();
  });

  it('should fallback to LLM classification if rule engine returns null', async () => {
    vi.mocked(ruleEngine.evaluate).mockReturnValue(null);
    vi.mocked(llmClassifier.classify).mockResolvedValue({
      categoryId: 'cat2',
      confidence: 0.8,
      reason: 'LLM_CLASSIFIED',
      tags: ['ai'],
    });

    const txn = {} as Transaction;
    const rules = [] as ClassificationRule[];
    const categories = [] as Category[];

    const result = await service.classify(txn, rules, categories);

    expect(result.categoryId).toBe('cat2');
    expect(llmClassifier.classify).toHaveBeenCalledWith(txn, categories);
  });

  it('should return default fallback if both fail', async () => {
    vi.mocked(ruleEngine.evaluate).mockReturnValue(null);
    vi.mocked(llmClassifier.classify).mockResolvedValue(null);

    const txn = {} as Transaction;
    const rules = [] as ClassificationRule[];
    const categories = [] as Category[];

    const result = await service.classify(txn, rules, categories);

    expect(result.reason).toBe('FALLBACK_UNCATEGORIZED');
    expect(result.categoryId).toBe(''); // or some default Uncategorized ID
    expect(result.confidence).toBe(0);
  });
});
