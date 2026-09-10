import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { LLMProvider } from '../interfaces/llm-provider.interface';
import { GenerateStructuredOptions, GenerateTextOptions, GenerateWithToolsOptions, ToolCall } from '../interfaces/llm-types';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenAI;
  private defaultModel = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const { prompt, systemInstruction, temperature, maxOutputTokens, model } = options;
    
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (temperature !== undefined) config.temperature = temperature;
    if (maxOutputTokens !== undefined) config.maxOutputTokens = maxOutputTokens;

    const response = await this.genAI.models.generateContent({
      model: model || this.defaultModel,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    return response.text || '';
  }

  async generateStructured<T extends z.ZodTypeAny>(options: GenerateStructuredOptions<T>): Promise<z.infer<T>> {
    const { prompt, schema, systemInstruction, temperature, maxOutputTokens, model } = options;
    
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
    console.log('Model:', model || this.defaultModel);
    console.log('System Instruction:', systemInstruction || 'None');
    console.log('Prompt:', prompt);
    console.log('Expected Schema Keys:', Object.keys(jsonSchema.properties || {}));
    console.log('==========================================================\n');

    // Save the exact prompt to a file so the user can read it cleanly (bypassing terminal encoding issues)
    require('fs').writeFileSync('last-llm-prompt.txt', prompt);

    const response = await this.genAI.models.generateContent({
      model: model || this.defaultModel,
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

    const parsed = JSON.parse(text);
    return schema.parse(parsed);
  }

  async generateWithTools(options: GenerateWithToolsOptions): Promise<{ text: string; toolCalls: ToolCall[] }> {
    const { prompt, tools, systemInstruction, temperature, maxOutputTokens, model } = options;
    
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

    const response = await this.genAI.models.generateContent({
      model: model || this.defaultModel,
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

    return {
      text: response.text || '',
      toolCalls,
    };
  }
}
