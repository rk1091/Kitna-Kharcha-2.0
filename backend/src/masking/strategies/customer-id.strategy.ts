import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class CustomerIdStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // Mask Customer ID / CIF numbers: 8 to 12 digits preceded by CIF, Cust ID, Customer ID, CRN
    const cidRegex = /\b(?:CIF|Cust\s*ID|Customer\s*ID|CRN|Client\s*ID)[\s:#-]*([0-9]{8,12})\b/gi;
    let match: RegExpExecArray | null;

    while ((match = cidRegex.exec(text)) !== null) {
      const id = match[1];
      const idIndex = match[0].lastIndexOf(id);
      matches.push({
        start: match.index + idIndex,
        end: match.index + idIndex + id.length,
        type: PIIType.CUSTOMER_ID,
        originalText: id,
        maskedText: '[CUSTOMER_ID]',
        confidence: 0.98,
      });
    }

    // Mask Nominee names in headers (e.g. Nominee: Mrs Priya Sharma)
    const nomineeRegex = /\b(?:Nominee(?:\s+Name)?|Nominee\s*:)[\s:]*([A-Za-z\s]{3,35})(?=\r|\n|$|,|;)/gi;
    while ((match = nomineeRegex.exec(text)) !== null) {
      const rawName = match[1].trim();
      if (rawName && !rawName.toLowerCase().includes('not registered') && !rawName.toLowerCase().includes('none') && rawName.toLowerCase() !== 'na') {
        const nameIndex = match[0].indexOf(match[1]);
        matches.push({
          start: match.index + nameIndex,
          end: match.index + nameIndex + rawName.length,
          type: PIIType.NOMINEE,
          originalText: rawName,
          maskedText: '[NOMINEE_REDACTED]',
          confidence: 0.85,
        });
      }
    }

    return matches;
  }
}
