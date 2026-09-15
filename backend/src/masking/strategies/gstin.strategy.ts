import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class GstinStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // GSTIN format: 2 digits + 5 chars + 4 digits + 1 char + 1 char/digit + Z + 1 char/digit
    const gstinRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]\b/g;
    let match: RegExpExecArray | null;

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

    return matches;
  }
}
