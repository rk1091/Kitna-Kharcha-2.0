import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class PersonalStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // Aadhaar regex: 12 digits, optionally separated by spaces or hyphens
    const aadhaarRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    let match;
    while ((match = aadhaarRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.AADHAAR,
        originalText: match[0],
        maskedText: '[AADHAAR]',
        confidence: 0.95,
      });
    }

    // Phone regex: 10 digits, optionally preceded by +91 or 91
    const phoneRegex = /(?:\+91|91)?[\s-]?[6-9]\d{9}\b/g;
    while ((match = phoneRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.PHONE,
        originalText: match[0],
        maskedText: '[PHONE]',
        confidence: 0.90,
      });
    }

    // Email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    while ((match = emailRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.EMAIL,
        originalText: match[0],
        maskedText: '[EMAIL]',
        confidence: 0.99,
      });
    }

    return matches;
  }
}
