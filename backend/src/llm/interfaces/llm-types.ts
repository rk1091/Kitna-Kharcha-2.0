import { z } from 'zod';

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface GenerateStructuredOptions<T extends z.ZodTypeAny> extends GenerateTextOptions {
  schema: T;
}

// Minimal tool calling config interfaces
export interface ToolConfig {
  name: string;
  description: string;
  parameters?: any; // JSON Schema for parameters
}

export interface GenerateWithToolsOptions extends GenerateTextOptions {
  tools: ToolConfig[];
}

export interface ToolCall {
  name: string;
  arguments: any;
}
