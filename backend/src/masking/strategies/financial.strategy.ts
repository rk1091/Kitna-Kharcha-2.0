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

    // GSTIN regex: 2 digits + 5 chars + 4 digits + 1 char + 1 digit/char + Z + 1 digit/char
    const gstinRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;
    while ((match = gstinRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.GSTIN,
        originalText: match[0],
        maskedText: '[GSTIN]',
        confidence: 0.99,
      });
    }

    // Credit Card regex: 16 digits (can be spaced like XXXX XXXX XXXX XXXX)
    const ccRegex = /\b(?:\d{4}[\s-]?){3}\d{4}\b/g;
    while ((match = ccRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.CREDIT_CARD,
        originalText: match[0],
        maskedText: '[CREDIT_CARD]',
        confidence: 0.95,
      });
    }

    // Card Product Type Redaction (Protects User's Card Tier Privacy)
    const cardTypeRegex = /\b(?:MoneyBack\+?|Millennia|Regalia|Infinia|Diners Club|SimplyCLICK|SimplySAVE|Amazon Pay|Flipkart Axis)\b/gi;
    while ((match = cardTypeRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.CREDIT_CARD, // Reusing CREDIT_CARD type for card products
        originalText: match[0],
        maskedText: '[CARD_TIER_REDACTED]',
        confidence: 0.90,
      });
    }

    return matches;
  }
}
