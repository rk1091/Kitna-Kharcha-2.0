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
      classifyBatch: vi.fn(),
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

  it('should batch classify: match rules locally first, batch LLM for remaining', async () => {
    const txn1 = { id: 'txn1', description: 'Swiggy' } as Transaction;
    const txn2 = { id: 'txn2', description: 'Mystery Merchant' } as Transaction;

    const rules = [{ id: 'rule1' }] as ClassificationRule[];
    const categories = [{ id: 'cat-food', name: 'Food & Dining' }] as Category[];

    // txn1 matches rule
    vi.mocked(ruleEngine.evaluate).mockImplementation((_rules, txn) => {
      if (txn.id === 'txn1') {
        return { categoryId: 'cat-food', confidence: 1.0, reason: 'COMPOUND_RULE', tags: ['food'] };
      }
      return null;
    });

    // txn2 classified via LLM batch
    vi.mocked(llmClassifier.classifyBatch).mockResolvedValue([
      { categoryId: 'cat-misc', confidence: 0.85, reason: 'LLM_CLASSIFIED', tags: ['misc'] },
    ]);

    const results = await service.classifyBatch([txn1, txn2], rules, categories);

    expect(results).toHaveLength(2);
    expect(results[0].categoryId).toBe('cat-food');
    expect(results[0].reason).toBe('COMPOUND_RULE');
    expect(results[1].categoryId).toBe('cat-misc');
    expect(results[1].reason).toBe('LLM_CLASSIFIED');

    // LLM should only have received txn2!
    expect(llmClassifier.classifyBatch).toHaveBeenCalledWith([txn2], categories);
  });
});
