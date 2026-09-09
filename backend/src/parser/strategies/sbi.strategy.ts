import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult, ParsedTransaction } from '../interfaces/parser.interface';
import { MerchantNormalizer } from '../merchant/merchant-normalizer';

@Injectable()
export class SbiStrategy implements BankParserStrategy {
  constructor(private readonly merchantNormalizer: MerchantNormalizer) {}

  async parse(text: string): Promise<ParseResult> {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const warnings: string[] = [];
    let successfulLines = 0;
    
    // Very basic regex for SBI
    const regex = /^(\d{2}-\w{3}-\d{2,4})\s+(.+?)\s+([\d.,]+)\s+(Cr|Dr)?$/i;

    for (const line of lines) {
      if (line.includes('Date') || line.includes('Balance')) continue;

      const match = line.match(regex);
      if (match) {
        const [_, dateStr, desc, amountStr, crDr] = match;
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        const type = (crDr && crDr.toUpperCase() === 'CR') ? 'CREDIT' : 'DEBIT';
        const merchantName = this.merchantNormalizer.normalize(desc);

        transactions.push({
          date: new Date(dateStr), // Might need actual parsing based on -Nov-
          amount,
          type,
          description: desc,
          merchantName,
        });
        successfulLines++;
      } else {
        warnings.push(`Could not parse line: ${line}`);
      }
    }

    const healthScore = lines.length ? Math.round((successfulLines / lines.length) * 100) : 0;

    // Throw if healthScore is very low (e.g., < 20%) to trigger fallback
    if (healthScore < 20) {
      throw new Error('Parsing failed for SBI format.');
    }

    return {
      transactions,
      bankName: 'SBI',
      healthScore,
      warnings,
      errors: []
    };
  }
}
