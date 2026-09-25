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
      const txnIdentifier = txn.id || txn.description || 'unidentified';
      this.logger.error(`LLM Classification failed for txn ${txnIdentifier}:`, error);
      return null;
    }
  }

  async classifyBatch(
    txns: Transaction[],
    categories: Category[],
  ): Promise<ClassificationResult[]> {
    if (!txns || txns.length === 0) return [];

    const defaultFallback: ClassificationResult = {
      categoryId: '',
      confidence: 0,
      reason: 'FALLBACK_UNCATEGORIZED',
      tags: [],
    };

    if (!categories || categories.length === 0) {
      return txns.map(() => ({ ...defaultFallback }));
    }

    try {
      const categoryList = categories.map((c) => `- ${c.id}: ${c.name} (${c.type})`).join('\n');
      const txnLines = txns
        .map(
          (t, idx) =>
            `[${idx}] Description: "${t.description || (t as any).normalizedDescription || ''}" | Amount: ${t.amountSigned} | Direction: ${t.direction}`,
        )
        .join('\n');

      const prompt = `Classify the following ${txns.length} financial transactions based on the available categories.

Available categories:
${categoryList}

Transactions to classify:
${txnLines}

Instructions:
1. For each transaction by its index [0 to ${txns.length - 1}], select the most appropriate categoryId from the available categories list.
2. Provide a confidence score between 0.0 and 1.0.
3. Generate 1-3 relevant lowercase tags.`;

      const schema = z.array(
        z.object({
          index: z.number().int().describe('The 0-based index of the transaction from the input list.'),
          categoryId: z.string().describe('The ID of the chosen category.'),
          confidence: z.number().min(0).max(1).describe('Confidence score between 0.0 and 1.0'),
          tags: z.array(z.string()).describe('1-3 relevant tags in lowercase'),
        }),
      );

      const items = await this.llmService.generateStructured({
        prompt,
        systemInstruction:
          'You are a high-accuracy, batch personal finance classifier. You analyze transactions and output structured JSON classifying each transaction by its index.',
        schema,
        temperature: 0.1,
      });

      const results: ClassificationResult[] = txns.map(() => ({ ...defaultFallback }));

      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item.index === 'number' && item.index >= 0 && item.index < txns.length) {
            if (categories.find((c) => c.id === item.categoryId)) {
              results[item.index] = {
                categoryId: item.categoryId,
                confidence: item.confidence,
                reason: 'LLM_CLASSIFIED',
                tags: item.tags || [],
              };
            } else {
              this.logger.warn(`Batch LLM returned invalid categoryId "${item.categoryId}" for txn index ${item.index}`);
            }
          }
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Batch LLM Classification failed for ${txns.length} transactions:`, error);
      return txns.map(() => ({ ...defaultFallback }));
    }
  }
}
