import { z } from 'zod';
import { GenerateStructuredOptions, GenerateTextOptions, GenerateWithToolsOptions, ToolCall } from './llm-types';

export interface LLMProvider {
  generateText(options: GenerateTextOptions): Promise<string>;
  generateStructured<T extends z.ZodTypeAny>(options: GenerateStructuredOptions<T>): Promise<z.infer<T>>;
  generateWithTools(options: GenerateWithToolsOptions): Promise<{ text: string; toolCalls: ToolCall[] }>;
}
