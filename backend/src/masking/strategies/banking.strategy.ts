import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class BankingStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // UPI ID regex
    const upiRegex = /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;
    let match;
    while ((match = upiRegex.exec(text)) !== null) {
      // Exclude simple emails that might look like UPI, usually UPI IDs don't have standard email domains
      // A simplistic approach is if it ends in common banks or 'okhdfcbank', 'ybl', etc., but we'll use regex
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.UPI_ID,
        originalText: match[0],
        maskedText: '[UPI_ID]',
        confidence: 0.85,
      });
    }

    // Balance regex: looking for Rs, INR, balance, available
    // e.g., Available balance is Rs 5000.00
    const balanceRegex = /(?:balance|bal|avl bal|available)[\s.:]*(?:rs|inr|₹)?[\s]*([\d,]+(?:\.\d{1,2})?)/gi;
    while ((match = balanceRegex.exec(text)) !== null) {
      const valueIndex = match[0].indexOf(match[1]);
      matches.push({
        start: match.index + valueIndex,
        end: match.index + valueIndex + match[1].length,
        type: PIIType.BALANCE,
        originalText: match[1],
        maskedText: '[BALANCE]',
        confidence: 0.90,
      });
    }

    // Beneficiary regex: e.g. transferred to XXX, paid to XXX
    const beneficiaryRegex = /(?:paid to|transferred to|sent to|received from)[\s]+([a-zA-Z\s]{3,30})/gi;
    while ((match = beneficiaryRegex.exec(text)) !== null) {
      const name = match[1].trim();
      if (name.length > 2) {
        const valueIndex = match[0].lastIndexOf(name);
        matches.push({
          start: match.index + valueIndex,
          end: match.index + valueIndex + name.length,
          type: PIIType.BENEFICIARY,
          originalText: name,
          maskedText: '[BENEFICIARY]',
          confidence: 0.80,
        });
      }
    }

    return matches;
  }
}
