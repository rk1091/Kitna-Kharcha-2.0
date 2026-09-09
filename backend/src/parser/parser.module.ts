import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { LlmFallbackStrategy } from './strategies/llm-fallback.strategy';
import { HdfcStrategy } from './strategies/hdfc.strategy';
import { SbiStrategy } from './strategies/sbi.strategy';
import { MerchantNormalizer } from './merchant/merchant-normalizer';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [
    ParserService,
    LlmFallbackStrategy,
    HdfcStrategy,
    SbiStrategy,
    MerchantNormalizer,
  ],
  exports: [ParserService],
})
export class ParserModule {}
