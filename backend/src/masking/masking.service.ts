import { Injectable } from '@nestjs/common';
import { MaskingResult, MaskMatch, MaskingStrategy } from './interfaces/masking.interface';
import { FinancialStrategy } from './strategies/financial.strategy';
import { PersonalStrategy } from './strategies/personal.strategy';
import { BankingStrategy } from './strategies/banking.strategy';
import { EncryptionUtil } from './encryption.util';
import * as crypto from 'crypto';

@Injectable()
export class MaskingService {
  private strategies: MaskingStrategy[];

  constructor() {
    this.strategies = [
      new FinancialStrategy(),
      new PersonalStrategy(),
      new BankingStrategy(),
    ];
  }

  public maskSync(text: string): MaskingResult {
    return this.processMasking(text);
  }

  public async mask(text: string, encryptionKey?: string): Promise<MaskingResult> {
    return this.processMasking(text, encryptionKey);
  }

  private processMasking(text: string, encryptionKey?: string): MaskingResult {
    let allMatches: MaskMatch[] = [];

    // Run all strategies
    for (const strategy of this.strategies) {
      const matches = strategy.detectAndMask(text);
      allMatches = allMatches.concat(matches);
    }

    // Deduplicate overlapping matches
    allMatches.sort((a, b) => {
      if (a.start === b.start) {
        return b.end - a.end; // longest first
      }
      return a.start - b.start;
    });

    const dedupedMatches: MaskMatch[] = [];
    let lastEnd = -1;

    for (const match of allMatches) {
      if (match.start >= lastEnd) {
        dedupedMatches.push(match);
        lastEnd = match.end;
      }
    }

    let maskedText = text;
    let offset = 0;
    let overallConfidence = 0;
    const encryptedMapping: Record<string, string> = {};

    for (const match of dedupedMatches) {
      overallConfidence += match.confidence;

      let replacement = match.maskedText;

      if (encryptionKey) {
        const encryptedValue = EncryptionUtil.encrypt(match.originalText, encryptionKey);
        const token = `[ENC_${crypto.randomBytes(4).toString('hex').toUpperCase()}]`;
        encryptedMapping[token] = encryptedValue;
        replacement = token;
        
        // Update the match object to reflect the token used
        match.maskedText = token;
      }

      const before = maskedText.substring(0, match.start + offset);
      const after = maskedText.substring(match.end + offset);
      
      maskedText = before + replacement + after;
      
      const lengthDiff = replacement.length - match.originalText.length;
      offset += lengthDiff;
    }

    const avgConfidence = dedupedMatches.length > 0 ? overallConfidence / dedupedMatches.length : 1;

    return {
      maskedText,
      report: dedupedMatches,
      overallConfidence: avgConfidence,
      ...(encryptionKey ? { encryptedMapping } : {}),
      flaggedForReview: avgConfidence < 0.8 && dedupedMatches.length > 0,
    };
  }
}
