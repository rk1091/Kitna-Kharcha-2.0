import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMService } from './llm.service';
import { GeminiProvider } from './providers/gemini.provider';

// Mock the GeminiProvider so it doesn't actually instantiate GoogleGenAI in this test
vi.mock('./providers/gemini.provider', () => {
  return {
    GeminiProvider: vi.fn().mockImplementation(() => {
      return {
        generateText: vi.fn().mockResolvedValue('mocked text'),
      };
    }),
  };
});

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should instantiate GeminiProvider by default when no LLM_PROVIDER is set', () => {
    delete process.env.LLM_PROVIDER;
    service = new LLMService();
    
    expect(service.provider).toBeDefined();
    expect(GeminiProvider).toHaveBeenCalledTimes(1);
  });

  it('should instantiate GeminiProvider when LLM_PROVIDER is gemini', () => {
    process.env.LLM_PROVIDER = 'gemini';
    service = new LLMService();
    
    expect(service.provider).toBeDefined();
    expect(GeminiProvider).toHaveBeenCalledTimes(1);
  });

  it('should throw an error for unsupported provider', () => {
    process.env.LLM_PROVIDER = 'openai';
    expect(() => new LLMService()).toThrow('Unsupported LLM provider: openai');
  });

  it('should delegate generateText to the provider', async () => {
    process.env.LLM_PROVIDER = 'gemini';
    service = new LLMService();
    
    const result = await service.generateText({ prompt: 'test' });
    expect(result).toBe('mocked text');
    expect(service.provider.generateText).toHaveBeenCalledWith({ prompt: 'test' });
  });
});
