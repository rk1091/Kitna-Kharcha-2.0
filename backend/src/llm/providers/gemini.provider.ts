import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { LLMProvider } from '../interfaces/llm-provider.interface';
import { GenerateStructuredOptions, GenerateTextOptions, GenerateWithToolsOptions, ToolCall } from '../interfaces/llm-types';
import { LlmTrackerService } from '../observability/llm-tracker.service';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenAI;
  private defaultModel = 'gemini-2.5-flash';
  private tracker?: LlmTrackerService;

  constructor(tracker?: LlmTrackerService) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenAI({ apiKey });
    this.tracker = tracker;
  }

  private recordMetrics(
    startTime: number,
    operation: string,
    model: string,
    prompt: string,
    response?: any,
    toolCalls?: ToolCall[],
    error?: any,
    userId?: string
  ) {
    if (!this.tracker) return;
    const latencyMs = Date.now() - startTime;
    const isSuccess = !error;

    let promptTokens = response?.usageMetadata?.promptTokenCount;
    let completionTokens = response?.usageMetadata?.candidatesTokenCount;
    let totalTokens = response?.usageMetadata?.totalTokenCount;

    if (promptTokens === undefined || promptTokens === null) {
      promptTokens = Math.max(1, Math.ceil(prompt.length / 4));
    }
    if (completionTokens === undefined || completionTokens === null) {
      const respText = response?.text || '';
      completionTokens = isSuccess ? Math.max(0, Math.ceil(respText.length / 4)) : 0;
    }
    if (totalTokens === undefined || totalTokens === null) {
      totalTokens = promptTokens + completionTokens;
    }

    this.tracker.recordLog({
      userId,
      operation,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      toolCalls: toolCalls && toolCalls.length > 0 ? JSON.stringify(toolCalls) : undefined,
      isSuccess,
      errorMessage: error?.message || null,
    }).catch(() => {});
  }

  private async generateContentWithRetry(params: any): Promise<any> {
    let attempts = 0;
    while (true) {
      try {
        return await this.genAI.models.generateContent(params);
      } catch (err: any) {
        attempts++;
        const errMsg = String(err?.message || err);
        const isQuota429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || err?.status === 429;
        if (attempts <= 1 && isQuota429) {
          let waitMs = 15000;
          const match = errMsg.match(/(?:retry\s+in\s+|retryDelay[:\s]+)(\d+(?:\.\d+)?)/i);
          if (match && match[1]) {
            waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 100;
          }
          console.warn(`[GeminiProvider] Quota 429 encountered: ${errMsg}. Waiting ${waitMs}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw err;
      }
    }
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const { prompt, systemInstruction, temperature, maxOutputTokens, model, userId, operation } = options;
    const startTime = Date.now();
    const modelName = model || this.defaultModel;
    const opName = operation || 'generateText';
    
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (temperature !== undefined) config.temperature = temperature;
    if (maxOutputTokens !== undefined) config.maxOutputTokens = maxOutputTokens;

    try {
      const response = await this.generateContentWithRetry({
        model: modelName,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const text = response.text || '';
      this.recordMetrics(startTime, opName, modelName, prompt, response, undefined, undefined, userId);
      return text;
    } catch (err: any) {
      this.recordMetrics(startTime, opName, modelName, prompt, undefined, undefined, err, userId);
      throw err;
    }
  }

  async generateStructured<T extends z.ZodTypeAny>(options: GenerateStructuredOptions<T>): Promise<z.infer<T>> {
    const { prompt, schema, systemInstruction, temperature, maxOutputTokens, model, userId, operation } = options;
    const startTime = Date.now();
    const modelName = model || this.defaultModel;
    const opName = operation || 'generateStructured';
    
    const jsonSchema = zodToJsonSchema(schema as any, { target: 'jsonSchema7' }) as any;
    
    // Remove unsupported fields that zodToJsonSchema might add which Gemini doesn't like
    if (jsonSchema.$schema) delete (jsonSchema as any).$schema;

    const config: any = {
      responseMimeType: 'application/json',
      responseSchema: jsonSchema,
    };
    
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (temperature !== undefined) config.temperature = temperature;
    if (maxOutputTokens !== undefined) config.maxOutputTokens = maxOutputTokens;

    console.log('\n================ LLM REQUEST (STRUCTURED) ================');
    console.log('Model:', modelName);
    console.log('System Instruction:', systemInstruction || 'None');
    console.log('Prompt:', prompt);
    console.log('Expected Schema Keys:', Object.keys(jsonSchema.properties || {}));
    console.log('==========================================================\n');

    try {
      // Save the exact prompt to a file so the user can read it cleanly (bypassing terminal encoding issues)
      try {
        require('fs').writeFileSync('last-llm-prompt.txt', prompt);
      } catch (_) {}

      const response = await this.generateContentWithRetry({
        model: modelName,
        contents: prompt,
        config,
      });

      const text = response.text || '';
      if (!text) {
        throw new Error('No text returned from Gemini API');
      }

      console.log('\n================ LLM RESPONSE (STRUCTURED) ================');
      console.log(text);
      console.log('===========================================================\n');

      this.recordMetrics(startTime, opName, modelName, prompt, response, undefined, undefined, userId);

      const parsed = JSON.parse(text);
      return schema.parse(parsed);
    } catch (err: any) {
      this.recordMetrics(startTime, opName, modelName, prompt, undefined, undefined, err, userId);
      throw err;
    }
  }

  async generateWithTools(options: GenerateWithToolsOptions): Promise<{ text: string; toolCalls: ToolCall[] }> {
    const { prompt, tools, systemInstruction, temperature, maxOutputTokens, model, userId, operation } = options;
    const startTime = Date.now();
    const modelName = model || this.defaultModel;
    const opName = operation || 'generateWithTools';
    
    const functionDeclarations = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    const config: any = {
      tools: [{ functionDeclarations }],
    };

    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (temperature !== undefined) config.temperature = temperature;
    if (maxOutputTokens !== undefined) config.maxOutputTokens = maxOutputTokens;

    try {
      const response = await this.generateContentWithRetry({
        model: modelName,
        contents: prompt,
        config,
      });

      const toolCalls: ToolCall[] = [];
      if (response.functionCalls && Array.isArray(response.functionCalls)) {
        for (const call of response.functionCalls) {
          toolCalls.push({
            name: call.name || 'unknown_tool',
            arguments: call.args,
          });
        }
      }

      this.recordMetrics(startTime, opName, modelName, prompt, response, toolCalls, undefined, userId);

      return {
        text: response.text || '',
        toolCalls,
      };
    } catch (err: any) {
      this.recordMetrics(startTime, opName, modelName, prompt, undefined, undefined, err, userId);
      throw err;
    }
  }
}
