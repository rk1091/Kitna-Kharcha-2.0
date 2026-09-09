import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParserService } from './parser.service';
import { HdfcStrategy } from './strategies/hdfc.strategy';
import { SbiStrategy } from './strategies/sbi.strategy';
import { LlmFallbackStrategy } from './strategies/llm-fallback.strategy';
import { ParseResult } from './interfaces/parser.interface';

describe('ParserService', () => {
  let service: ParserService;
  let hdfcMock: HdfcStrategy;
  let sbiMock: SbiStrategy;
  let llmMock: LlmFallbackStrategy;

  beforeEach(() => {
    hdfcMock = { parse: vi.fn() } as any;
    sbiMock = { parse: vi.fn() } as any;
    llmMock = { parse: vi.fn() } as any;
    
    service = new ParserService(hdfcMock, sbiMock, llmMock);
  });

  it('should use HdfcStrategy if healthScore is high', async () => {
    const fakeResult: ParseResult = {
      transactions: [],
      bankName: 'HDFC',
      healthScore: 90,
      warnings: [],
      errors: []
    };
    (hdfcMock.parse as any).mockResolvedValue(fakeResult);

    const result = await service.parse('some text');
    
    expect(hdfcMock.parse).toHaveBeenCalled();
    expect(sbiMock.parse).not.toHaveBeenCalled();
    expect(llmMock.parse).not.toHaveBeenCalled();
    expect(result.bankName).toBe('HDFC');
  });

  it('should fallback to SbiStrategy if HDFC healthScore is low', async () => {
    const fakeHdfcResult: ParseResult = {
      transactions: [],
      bankName: 'HDFC',
      healthScore: 10, // low score
      warnings: [],
      errors: []
    };
    const fakeSbiResult: ParseResult = {
      transactions: [],
      bankName: 'SBI',
      healthScore: 80, // high score
      warnings: [],
      errors: []
    };

    (hdfcMock.parse as any).mockResolvedValue(fakeHdfcResult);
    (sbiMock.parse as any).mockResolvedValue(fakeSbiResult);

    const result = await service.parse('some text');

    expect(hdfcMock.parse).toHaveBeenCalled();
    expect(sbiMock.parse).toHaveBeenCalled();
    expect(llmMock.parse).not.toHaveBeenCalled();
    expect(result.bankName).toBe('SBI');
  });

  it('should fallback to LLM if both HDFC and SBI have low healthScore', async () => {
    const lowScoreResult: ParseResult = {
      transactions: [],
      bankName: 'HDFC',
      healthScore: 10,
      warnings: [],
      errors: []
    };
    const llmResult: ParseResult = {
      transactions: [],
      bankName: 'Unknown',
      healthScore: 95,
      warnings: [],
      errors: []
    };

    (hdfcMock.parse as any).mockResolvedValue(lowScoreResult);
    (sbiMock.parse as any).mockResolvedValue({ ...lowScoreResult, bankName: 'SBI' });
    (llmMock.parse as any).mockResolvedValue(llmResult);

    const result = await service.parse('some text');

    expect(hdfcMock.parse).toHaveBeenCalled();
    expect(sbiMock.parse).toHaveBeenCalled();
    expect(llmMock.parse).toHaveBeenCalled();
    expect(result.bankName).toBe('Unknown');
  });

  it('should fallback to LLM if strategy throws an error', async () => {
    (hdfcMock.parse as any).mockRejectedValue(new Error('HDFC Error'));
    (sbiMock.parse as any).mockRejectedValue(new Error('SBI Error'));
    
    const llmResult: ParseResult = {
      transactions: [],
      bankName: 'Unknown',
      healthScore: 95,
      warnings: [],
      errors: []
    };
    (llmMock.parse as any).mockResolvedValue(llmResult);

    const result = await service.parse('some text');

    expect(hdfcMock.parse).toHaveBeenCalled();
    expect(sbiMock.parse).toHaveBeenCalled();
    expect(llmMock.parse).toHaveBeenCalled();
    expect(result.bankName).toBe('Unknown');
  });
});
