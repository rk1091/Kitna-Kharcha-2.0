import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { ClassificationRule } from '../interfaces/classification.interface';

@Injectable()
export class FeedbackService {
  suggestRule(txn: Transaction, categoryId: string): Omit<ClassificationRule, 'id'> {
    let keyword = '';

    // Prefer normalizedDescription if present (clean merchant name)
    const preferredSource = (txn as any).normalizedDescription || txn.description || '';

    if (preferredSource) {
      const words = preferredSource.split(/[\s_-]+/).filter((w: string) => w.length > 2);
      if (words.length > 0) {
        keyword = words[0].toLowerCase();
      } else {
        keyword = preferredSource.toLowerCase();
      }
    }

    return {
      categoryId,
      conditions: {
        descriptionContains: keyword,
        direction: txn.direction,
      },
      tags: [],
    };
  }
}
