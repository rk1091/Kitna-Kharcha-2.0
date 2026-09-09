import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult, ParsedTransaction } from '../interfaces/parser.interface';
import { MerchantNormalizer } from '../merchant/merchant-normalizer';

@Injectable()
export class HdfcStrategy implements BankParserStrategy {
  constructor(private readonly merchantNormalizer: MerchantNormalizer) {}

  async parse(text: string): Promise<ParseResult> {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const warnings: string[] = [];
    let successfulLines = 0;
    
    // Simple regex for HDFC (example format: "DD/MM/YY  Description  Amount")
    // Assuming format: Date (DD/MM/YY), Description, Ref No, Value Date, Withdrawal(Dr), Deposit(Cr), Balance
    const regex = /^(\d{2}\/\d{2}\/\d{2,4})\s+(.+?)\s+([0-9.,]+)\s+(Cr|Dr|CR|DR)?\s+([0-9.,]+)?$/i;

    for (const line of lines) {
      if (line.includes('Date') || line.includes('Balance')) continue;
      
      const match = line.match(regex);
      if (match) {
        // Very basic naive parsing, in reality this would be more complex
        const [_, dateStr, desc, amountStr, crDr] = match;
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        const type = (crDr && crDr.toUpperCase() === 'CR') ? 'CREDIT' : 'DEBIT'; // Assuming DR default
        const merchantName = this.merchantNormalizer.normalize(desc);

        transactions.push({
          date: new Date(dateStr),
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

    return {
      transactions,
      bankName: 'HDFC',
      healthScore,
      warnings,
      errors: []
    };
  }
}
