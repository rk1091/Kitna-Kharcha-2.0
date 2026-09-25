import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMClassifierService } from './llm-classifier.service';
import { LLMService } from '../../llm/llm.service';
import { Transaction, Category } from '@prisma/client';

describe('LLMClassifierService', () => {
  let service: LLMClassifierService;
  let llmService: LLMService;

  beforeEach(() => {
    llmService = {
      generateStructured: vi.fn(),
    } as unknown as LLMService;
    service = new LLMClassifierService(llmService);
  });

  it('should categorize a transaction using LLM', async () => {
    vi.mocked(llmService.generateStructured).mockResolvedValue({
      categoryId: 'cat1',
      confidence: 0.9,
      tags: ['food', 'online'],
    });

    const txn = {
      description: 'Zomato order',
      amountSigned: -500,
      direction: 'DEBIT',
    } as unknown as Transaction;

    const categories = [
      { id: 'cat1', name: 'Food & Dining', type: 'EXPENSE' },
      { id: 'cat2', name: 'Travel', type: 'EXPENSE' },
    ] as Category[];

    const result = await service.classify(txn, categories);

    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('cat1');
    expect(result?.reason).toBe('LLM_CLASSIFIED');
    expect(result?.confidence).toBe(0.9);
    expect(result?.tags).toEqual(['food', 'online']);
    expect(llmService.generateStructured).toHaveBeenCalled();
  });

  it('should return null if LLM throws', async () => {
    vi.mocked(llmService.generateStructured).mockRejectedValue(new Error('LLM error'));
    
    const txn = { description: 'Zomato order', amountSigned: -500, direction: 'DEBIT' } as unknown as Transaction;
    const categories = [{ id: 'cat1', name: 'Food', type: 'EXPENSE' }] as Category[];

    const result = await service.classify(txn, categories);
    expect(result).toBeNull();
  });

  it('should classify multiple transactions in a single batch call', async () => {
    const txns = [
      { id: '1', description: 'Unknown Cafe', amountSigned: -150, direction: 'DEBIT' },
      { id: '2', description: 'Hardware Store', amountSigned: -600, direction: 'DEBIT' },
    ] as any[];
    const categories = [
      { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE' },
      { id: 'cat-shop', name: 'Shopping', type: 'EXPENSE' },
    ] as any[];

    vi.mocked(llmService.generateStructured).mockResolvedValue([
      { index: 0, categoryId: 'cat-food', confidence: 0.9, tags: ['cafe'] },
      { index: 1, categoryId: 'cat-shop', confidence: 0.85, tags: ['hardware'] },
    ]);

    const results = await service.classifyBatch(txns, categories);
    expect(results.length).toBe(2);
    expect(results[0].categoryId).toBe('cat-food');
    expect(results[1].categoryId).toBe('cat-shop');
    expect(llmService.generateStructured).toHaveBeenCalledTimes(1);
  });
});
