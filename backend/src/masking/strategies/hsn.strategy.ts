import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class HsnStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // HSN/SAC codes: e.g. HSN: 998314, SAC 9983, HSN/SAC: 998311
    const hsnRegex = /\b(?:HSN[\s/]*SAC|HSN|SAC)[\s:]*([0-9]{4,8})\b/gi;
    let match: RegExpExecArray | null;

    while ((match = hsnRegex.exec(text)) !== null) {
      const code = match[1];
      const codeIndex = match[0].lastIndexOf(code);
      matches.push({
        start: match.index + codeIndex,
        end: match.index + codeIndex + code.length,
        type: PIIType.HSN,
        originalText: code,
        maskedText: '[HSN]',
        confidence: 0.95,
      });
    }

    return matches;
  }
}
