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
    const phoneRegex = /(?:\+91[\s-]?|\b91[\s-]|\b)[6-9]\d{9}\b/g;
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

    // Basic Address heuristic: Looks for common address prefixes followed by text and a 6-digit PIN code
    const addressRegex = /\b(?:House|H\.No|Plot|Flat|Apt|Apartment|Street|Road|Nagar|Block|Phase|Estate)[\s\S]{10,200}?\b[1-9][0-9]{5}\b/gi;
    while ((match = addressRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.ADDRESS,
        originalText: match[0],
        maskedText: '[ADDRESS_REDACTED]',
        confidence: 0.85,
      });
    }

    // Fallback: If just a naked PIN code with a state (like GURGAON 122009 HAR) is found, mask it
    const pinRegex = /\b[A-Z]{3,20}\s+[1-9][0-9]{5}\s+[A-Z]{2,3}\b/gi;
    while ((match = pinRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.ADDRESS,
        originalText: match[0],
        maskedText: '[PINCODE_REDACTED]',
        confidence: 0.80,
      });
    }

    return matches;
  }
}
