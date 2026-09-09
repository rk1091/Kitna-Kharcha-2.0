import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class FinancialStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // PAN regex: 5 chars, 4 digits, 1 char
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    let match;
    while ((match = panRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.PAN,
        originalText: match[0],
        maskedText: '[PAN]',
        confidence: 0.99,
      });
    }

    // IFSC regex: 4 chars, 0, 6 chars/digits
    const ifscRegex = /[A-Z]{4}0[A-Z0-9]{6}/g;
    while ((match = ifscRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.IFSC,
        originalText: match[0],
        maskedText: '[IFSC]',
        confidence: 0.95,
      });
    }

    // Account Number regex: 9-18 digits, optionally preceded by "A/c" or "Account"
    const accRegex = /(?:a\/c|account|acct)[\s.:-]*([0-9]{9,18})/gi;
    while ((match = accRegex.exec(text)) !== null) {
      matches.push({
        start: match.index + match[0].indexOf(match[1]), // Index of the digits part
        end: match.index + match[0].indexOf(match[1]) + match[1].length,
        type: PIIType.ACCOUNT_NUMBER,
        originalText: match[1],
        maskedText: '[ACCOUNT_NUMBER]',
        confidence: 0.90,
      });
    }

    return matches;
  }
}
