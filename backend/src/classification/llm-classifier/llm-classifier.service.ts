import { Injectable, Logger } from '@nestjs/common';
import { Transaction, Category } from '@prisma/client';
import { ClassificationResult } from '../interfaces/classification.interface';
import { LLMService } from '../../llm/llm.service';
import { z } from 'zod';

@Injectable()
export class LLMClassifierService {
  private readonly logger = new Logger(LLMClassifierService.name);

  constructor(private readonly llmService: LLMService) {}

  async classify(txn: Transaction, categories: Category[]): Promise<ClassificationResult | null> {
    try {
      const categoryList = categories.map(c => `- ${c.id}: ${c.name} (${c.type})`).join('\n');
      
      const prompt = `Classify this transaction:
Description: ${txn.description}
Amount: ${txn.amountSigned}
Direction: ${txn.direction}

Available categories:
${categoryList}

Choose the best categoryId and provide a confidence score between 0.0 and 1.0. Also generate 1-3 relevant tags.`;

      const schema = z.object({
        categoryId: z.string().describe('The ID of the chosen category from the available categories list.'),
        confidence: z.number().min(0).max(1).describe('Confidence score between 0.0 and 1.0'),
        tags: z.array(z.string()).describe('1-3 relevant tags in lowercase'),
      });

      const result = await this.llmService.generateStructured({
        prompt,
        systemInstruction: 'You are a precise financial transaction classifier. You only return structured JSON matching the provided schema.',
        schema,
        temperature: 0.1,
      });

      // Verify the returned category ID actually exists in the list
      if (!categories.find(c => c.id === result.categoryId)) {
        this.logger.warn(`LLM returned invalid categoryId: ${result.categoryId}`);
        return null;
      }

      return {
        categoryId: result.categoryId,
        confidence: result.confidence,
        reason: 'LLM_CLASSIFIED',
        tags: result.tags,
      };
    } catch (error) {
      this.logger.error(`LLM Classification failed for txn ${txn.id}:`, error);
      return null;
    }
  }
}
