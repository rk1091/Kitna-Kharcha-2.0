import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { ClassificationRule } from '../interfaces/classification.interface';

@Injectable()
export class FeedbackService {
  suggestRule(txn: Transaction, categoryId: string): Omit<ClassificationRule, 'id'> {
    let keyword = '';
    if (txn.description) {
      const words = txn.description.split(/[\s_-]+/).filter(w => w.length > 3);
      if (words.length > 0) {
        keyword = words[0].toLowerCase();
      } else {
        keyword = txn.description.toLowerCase();
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
