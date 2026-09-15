import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class CardTypeStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // Mask Credit Card tiers/product names (e.g. MoneyBack, Regalia, Infinia, Sapphiro, Coral, Platinum)
    const cardTypeRegex = /\b(?:Infinia|Regalia(?:\s+Gold)?|MoneyBack(?:\+)?|Millennia|Sapphiro|Rubyx|Coral|Emerald|Diners(?:\s+Club|\s+Black)?|SimplyCLICK|SimplySAVE|Amazon\s+Pay|Flipkart\s+Axis|Magnus|Atlas|Platinum|Titanium|Signature|Infinite|Privilege)\b/gi;
    let match: RegExpExecArray | null;

    while ((match = cardTypeRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.CARD_TYPE,
        originalText: match[0],
        maskedText: '[CARD_TIER_REDACTED]',
        confidence: 0.90,
      });
    }

    return matches;
  }
}
