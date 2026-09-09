import { Injectable, Logger } from '@nestjs/common';
import { ParseResult } from './interfaces/parser.interface';
import { HdfcStrategy } from './strategies/hdfc.strategy';
import { SbiStrategy } from './strategies/sbi.strategy';
import { LlmFallbackStrategy } from './strategies/llm-fallback.strategy';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  
  constructor(
    private readonly hdfcStrategy: HdfcStrategy,
    private readonly sbiStrategy: SbiStrategy,
    private readonly llmFallbackStrategy: LlmFallbackStrategy,
  ) {}

  async parse(maskedText: string): Promise<ParseResult> {
    const strategies = [this.hdfcStrategy, this.sbiStrategy];

    for (const strategy of strategies) {
      try {
        const result = await strategy.parse(maskedText);
        if (result.healthScore >= 50) {
          this.logger.log(`Successfully parsed with ${result.bankName} strategy. Health: ${result.healthScore}`);
          return result;
        } else {
          this.logger.warn(`Strategy ${strategy.constructor.name} returned low health score: ${result.healthScore}`);
        }
      } catch (error) {
        this.logger.warn(`Strategy ${strategy.constructor.name} failed with error: ${error.message}`);
      }
    }

    this.logger.log('Falling back to LLM Parsing Strategy');
    return this.llmFallbackStrategy.parse(maskedText);
  }
}
