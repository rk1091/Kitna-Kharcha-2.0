import { Injectable } from '@nestjs/common';
import { LLMProvider } from './interfaces/llm-provider.interface';
import { GenerateStructuredOptions, GenerateTextOptions, GenerateWithToolsOptions, ToolCall } from './interfaces/llm-types';
import { GeminiProvider } from './providers/gemini.provider';
import { z } from 'zod';

@Injectable()
export class LLMService implements LLMProvider {
  public provider: LLMProvider;

  constructor() {
    const providerName = process.env.LLM_PROVIDER || 'gemini';

    switch (providerName.toLowerCase()) {
      case 'gemini':
        this.provider = new GeminiProvider();
        break;
      // In the future, add other providers here like openai, anthropic, etc.
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    return this.provider.generateText(options);
  }

  async generateStructured<T extends z.ZodTypeAny>(options: GenerateStructuredOptions<T>): Promise<z.infer<T>> {
    return this.provider.generateStructured(options);
  }

  async generateWithTools(options: GenerateWithToolsOptions): Promise<{ text: string; toolCalls: ToolCall[] }> {
    return this.provider.generateWithTools(options);
  }
}
