import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from './gemini.provider';
import { z } from 'zod';

// Mock @google/genai
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: vi.fn(),
        },
      };
    }),
  };
});

import { GoogleGenAI } from '@google/genai';

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockGenerateContent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    provider = new GeminiProvider();
    
    // Get the mocked instance
    const mockedGenAI = new GoogleGenAI({ apiKey: 'test-key' }) as any;
    mockGenerateContent = mockedGenAI.models.generateContent;
    
    // Re-instantiate provider with our manually patched mock to easily assert on it, 
    // or just mock the prototype.
    // Let's replace the provider's internal genAI instance with one we can easily control.
    provider['genAI'] = {
      models: {
        generateContent: mockGenerateContent,
      }
    } as any;
  });

  describe('generateText', () => {
    it('should call generateContent with correct parameters and return text', async () => {
      const mockResponse = {
        text: 'mocked response',
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await provider.generateText({
        prompt: 'test prompt',
        systemInstruction: 'test system',
        temperature: 0.5,
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: 'test prompt',
        config: {
          systemInstruction: 'test system',
          temperature: 0.5,
        }
      });
      expect(result).toBe('mocked response');
    });
  });

  describe('generateStructured', () => {
    it('should call generateContent with JSON schema and return parsed object', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const mockResponse = {
        text: '{"name": "John", "age": 30}',
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await provider.generateStructured({
        prompt: 'test prompt',
        schema,
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-2.5-flash',
        contents: 'test prompt',
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          responseSchema: expect.any(Object), // we expect zod-to-json-schema output here
        })
      }));
      
      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('generateWithTools', () => {
    it('should call generateContent with tools config and extract tool calls', async () => {
      const mockResponse = {
        text: 'Let me do that',
        functionCalls: [
          {
            name: 'getWeather',
            args: { location: 'London' }
          }
        ]
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await provider.generateWithTools({
        prompt: 'test prompt',
        tools: [
          {
            name: 'getWeather',
            description: 'Get weather',
            parameters: { type: 'object', properties: { location: { type: 'string' } } }
          }
        ]
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-2.5-flash',
        contents: 'test prompt',
        config: expect.objectContaining({
          tools: [{
            functionDeclarations: [
              {
                name: 'getWeather',
                description: 'Get weather',
                parameters: { type: 'object', properties: { location: { type: 'string' } } }
              }
            ]
          }]
        })
      }));
      
      expect(result.text).toBe('Let me do that');
      expect(result.toolCalls).toEqual([
        { name: 'getWeather', arguments: { location: 'London' } }
      ]);
    });
  });
});
