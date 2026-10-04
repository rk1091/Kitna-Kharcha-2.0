import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { LlmFallbackStrategy } from './strategies/llm-fallback.strategy';
import { HdfcStrategy } from './strategies/hdfc.strategy';
import { SbiStrategy } from './strategies/sbi.strategy';
import { GenericStrategy } from './strategies/generic.strategy';
import { MerchantNormalizer } from './merchant/merchant-normalizer';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [
    MerchantNormalizer,
    GenericStrategy,
    HdfcStrategy,
    SbiStrategy,
    LlmFallbackStrategy,
    ParserService,
  ],
  exports: [ParserService],
})
export class ParserModule {}
