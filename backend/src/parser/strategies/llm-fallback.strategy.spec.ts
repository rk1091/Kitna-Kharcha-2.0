import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlmFallbackStrategy } from './llm-fallback.strategy';
import { LLMService } from '../../llm';

describe('LlmFallbackStrategy', () => {
  let strategy: LlmFallbackStrategy;
  let llmServiceMock: Partial<LLMService>;

  beforeEach(() => {
    llmServiceMock = {
      generateStructured: vi.fn(),
    };
    strategy = new LlmFallbackStrategy(llmServiceMock as LLMService);
  });

  it('should call LLMService to generate structured data', async () => {
    const fakeResult = {
      transactions: [
        { date: '2023-10-01T00:00:00.000Z', amount: 500, type: 'DEBIT', description: 'Amazon', merchantName: 'Amazon' }
      ],
      bankName: 'UnknownBank',
      healthScore: 100,
      warnings: [],
      errors: []
    };

    (llmServiceMock.generateStructured as any).mockResolvedValue(fakeResult);

    const result = await strategy.parse('Some random statement text');

    expect(llmServiceMock.generateStructured).toHaveBeenCalled();
    const args = (llmServiceMock.generateStructured as any).mock.calls[0][0];
    
    expect(args.prompt).toContain('Some random statement text');
    expect(args.systemInstruction).toContain('masked');
    expect(result.transactions[0].amount).toBe(500);
    expect(result.bankName).toBe('UnknownBank');
  });

  it('should map the resulting date strings to Date objects if needed', async () => {
    const fakeResult = {
      transactions: [
        { date: '2023-10-01T00:00:00.000Z', amount: 500, type: 'DEBIT', description: 'Amazon', merchantName: 'Amazon' }
      ],
      bankName: 'UnknownBank',
      healthScore: 100,
      warnings: [],
      errors: []
    };

    (llmServiceMock.generateStructured as any).mockResolvedValue(fakeResult);

    const result = await strategy.parse('Some random statement text');
    
    expect(result.transactions[0].date).toBeInstanceOf(Date);
  });
});
