import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult, ParsedTransaction, TransactionType } from '../interfaces/parser.interface';
import { MerchantNormalizer } from '../merchant/merchant-normalizer';

@Injectable()
export class GenericStrategy implements BankParserStrategy {
  constructor(private readonly merchantNormalizer: MerchantNormalizer) {}

  async parse(text: string): Promise<ParseResult> {
    const transactions: ParsedTransaction[] = [];
    const warnings: string[] = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      return {
        transactions: [],
        bankName: 'Generic Bank',
        healthScore: 0,
        warnings: ['Empty statement content'],
        errors: [],
      };
    }

    let candidateLines = 0;
    let successfulLines = 0;

    for (const line of lines) {
      if (this.isHeaderOrNoise(line)) {
        continue;
      }

      const dateMatch = this.extractDate(line);
      if (!dateMatch) {
        continue;
      }

      candidateLines++;
      const parsedTxn = this.parseTransactionLine(line, dateMatch);
      if (parsedTxn) {
        transactions.push(parsedTxn);
        successfulLines++;
      } else {
        warnings.push(`Failed to parse line: ${line}`);
      }
    }

    const healthScore = candidateLines > 0
      ? Math.round((successfulLines / candidateLines) * 100)
      : 0;

    return {
      transactions,
      bankName: 'Generic Bank',
      healthScore,
      warnings,
      errors: [],
    };
  }

  private isHeaderOrNoise(line: string): boolean {
    const lower = line.toLowerCase();
    const noiseKeywords = [
      'opening balance',
      'closing balance',
      'statement of account',
      'account statement',
      'page ',
      'generated on',
      'total debit',
      'total credit',
    ];
    if (noiseKeywords.some(kw => lower.includes(kw))) {
      return true;
    }

    // Header rows with column names
    const headerIndicators = ['particulars', 'narration', 'description', 'withdrawal', 'deposit', 'chq/ref'];
    const matchCount = headerIndicators.filter(h => lower.includes(h)).length;
    return matchCount >= 2;
  }

  private extractDate(line: string): { date: Date; raw: string; index: number } | null {
    // 1. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyRegex = /\b([0-3]?\d)[\/\-\.]([0-1]?\d)[\/\-\.](\d{2,4})\b/;
    const dmyMatch = line.match(dmyRegex);
    if (dmyMatch && dmyMatch.index !== undefined) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += year > 50 ? 1900 : 2000;

      if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        return {
          date: new Date(Date.UTC(year, month, day)),
          raw: dmyMatch[0],
          index: dmyMatch.index,
        };
      }
    }

    // 2. DD-Mon-YYYY or DD Mon YYYY (e.g. 15 Jan 2026, 15-Jan-26)
    const dMonYRegex = /\b([0-3]?\d)[\s\-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-](\d{2,4})\b/i;
    const dMonYMatch = line.match(dMonYRegex);
    if (dMonYMatch && dMonYMatch.index !== undefined) {
      const day = parseInt(dMonYMatch[1], 10);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = monthNames.indexOf(dMonYMatch[2].toLowerCase().substring(0, 3));
      let year = parseInt(dMonYMatch[3], 10);
      if (year < 100) year += year > 50 ? 1900 : 2000;

      if (day >= 1 && day <= 31 && month !== -1) {
        return {
          date: new Date(Date.UTC(year, month, day)),
          raw: dMonYMatch[0],
          index: dMonYMatch.index,
        };
      }
    }

    // 3. YYYY-MM-DD or YYYY/MM/DD
    const ymdRegex = /\b(\d{4})[\/\-]([0-1]?\d)[\/\-]([0-3]?\d)\b/;
    const ymdMatch = line.match(ymdRegex);
    if (ymdMatch && ymdMatch.index !== undefined) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        return {
          date: new Date(Date.UTC(year, month, day)),
          raw: ymdMatch[0],
          index: ymdMatch.index,
        };
      }
    }

    return null;
  }

  private parseTransactionLine(
    line: string,
    dateInfo: { date: Date; raw: string; index: number },
  ): ParsedTransaction | null {
    // Remove the date string from the line to inspect the rest
    const beforeDate = line.substring(0, dateInfo.index).trim();
    const afterDate = line.substring(dateInfo.index + dateInfo.raw.length).trim();
    const remainingLine = `${beforeDate} ${afterDate}`.trim();

    // Look for monetary amounts: numbers with optional commas and 2 decimal places
    // Matches e.g. "1,500.00", "5000", "75,000.50"
    const amountRegex = /(?:₹|Rs\.?|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})?)/g;
    const amountMatches: { value: number; raw: string; index: number }[] = [];
    let m: RegExpExecArray | null;

    while ((m = amountRegex.exec(remainingLine)) !== null) {
      const cleaned = m[1].replace(/,/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) {
        amountMatches.push({
          value: num,
          raw: m[0],
          index: m.index,
        });
      }
    }

    if (amountMatches.length === 0) {
      return null;
    }

    // Determine type: CR / DR indicator, salary/credit keywords, or column position
    let type: TransactionType = 'DEBIT';
    const upperRemaining = remainingLine.toUpperCase();

    const hasExplicitCredit = /\b(CR|CREDIT)\b/i.test(upperRemaining);
    const hasExplicitDebit = /\b(DR|DEBIT)\b/i.test(upperRemaining);

    // Deterministic salary and credit pattern detection
    const isSalaryOrPayroll = /\b(?:salary|payroll|monthly\s*pay|sal\s*credit|accenture|tcs|infosys|wipro|cognizant|google|microsoft|amazon\s*dev)\b/i.test(remainingLine);
    const isIncomeKeyword = /\b(?:refund|cashback|reversal|interest\s*credit|dividend)\b/i.test(remainingLine);

    if (hasExplicitCredit) {
      type = 'CREDIT';
    } else if (hasExplicitDebit) {
      type = 'DEBIT';
    } else if (isSalaryOrPayroll || isIncomeKeyword) {
      type = 'CREDIT';
    } else {
      type = 'DEBIT';
    }

    let amount = amountMatches[0].value;
    let balance: number | undefined;

    // If multiple amounts are detected:
    // Case 1: [Amount, Balance]
    if (amountMatches.length === 2) {
      amount = amountMatches[0].value;
      balance = amountMatches[1].value;
    } 
    // Case 2: [Debit, Credit, Balance] or [Withdrawal, Deposit, Balance]
    else if (amountMatches.length >= 3) {
      // If explicit credit, amount is usually second
      if (type === 'CREDIT') {
        amount = amountMatches[1].value;
      } else {
        amount = amountMatches[0].value;
      }
      balance = amountMatches[amountMatches.length - 1].value;
    }

    // Extract description by removing amounts and CR/DR flags
    let description = remainingLine;
    for (const am of amountMatches) {
      description = description.replace(am.raw, ' ');
    }
    description = description
      .replace(/\b(CR|DR|CREDIT|DEBIT)\b/gi, ' ')
      .replace(/[|;\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!description) {
      description = 'Bank Transaction';
    }

    const merchantName = this.merchantNormalizer.normalize(description);

    return {
      date: dateInfo.date,
      amount,
      type,
      description,
      merchantName,
      balance,
    };
  }
}
