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
    
    // If the line is an actual transaction SMS / alert, don't drop it as noise
    const isTransactionAlert = /\b(debited|credited|paid\s+to|transferred|withdrawn|spent)\b/i.test(line);

    const noiseKeywords = [
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

    if (!isTransactionAlert && /^(?:opening|closing)\s*balance/i.test(lower.trim())) {
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
    // 1. Remove the primary date from line
    const beforeDate = line.substring(0, dateInfo.index).trim();
    const afterDate = line.substring(dateInfo.index + dateInfo.raw.length).trim();
    let workingLine = `${beforeDate} ${afterDate}`.trim();

    // 2. Remove secondary dates (e.g. Value Date)
    const dmyRegex = /\b[0-3]?\d[\/\-\.][0-1]?\d[\/\-\.]\d{2,4}\b/g;
    const dMonYRegex = /\b[0-3]?\d[\s\-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]\d{2,4}\b/gi;
    const ymdRegex = /\b\d{4}[\/\-][0-1]?\d[\/\-][0-3]?\d\b/g;
    workingLine = workingLine
      .replace(dmyRegex, ' ')
      .replace(dMonYRegex, ' ')
      .replace(ymdRegex, ' ');

    // 3. Remove timestamps (e.g. 14:32:05)
    workingLine = workingLine.replace(/\b\d{1,2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?\s*(?:AM|PM|am|pm)?\b/g, ' ');

    // 4. Extract explicit balance if labeled (e.g. Bal: Rs 25,000, Avail Bal: 15,200.50)
    let explicitBalance: number | undefined;
    const balRegex = /(?:available\s*balance|avail\s*bal|avl\s*bal|closing\s*balance|closing\s*bal|balance|bal)[\s.:]*(?:(?:₹|Rs\.?|INR|\$)\s*)?([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;
    const balMatch = workingLine.match(balRegex);
    if (balMatch && balMatch.index !== undefined) {
      const parsed = parseFloat(balMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed >= 0) {
        explicitBalance = parsed;
        const matchIdx = balMatch.index;
        workingLine = workingLine.substring(0, matchIdx) + ' ' + workingLine.substring(matchIdx + balMatch[0].length);
      }
    }

    // 5. Strip account/card numbers (e.g. A/c ending 1234, A/c *1234, Card 4321, XX1234)
    workingLine = workingLine.replace(/(?:a\/c|account|acct|card|ending|ending\s*in)[\s.:#*-]*[X*]*\d{3,6}\b/gi, ' ');
    workingLine = workingLine.replace(/\b[X*]{2,}\d{3,6}\b/gi, ' ');

    // 6. Strip labeled reference numbers, cheque numbers, order numbers
    workingLine = workingLine.replace(/(?:ref|reference|utr|rrn|chq|cheque|txn|transaction|order|invoice|id|no)[\s.:#-]*([0-9]{4,20})\b/gi, ' ');

    // 7. Strip UPI / banking transaction prefixes with references
    workingLine = workingLine.replace(/\b(?:UPI|IMPS|NEFT|RTGS|POS|INB|BIL|MOB)[/-](?:(?:CR|DR)[/-])?/gi, ' ');
    workingLine = workingLine.replace(/\b(?:POS|CHQ|REF|TXN)\s+[0-9]{4,16}\b/gi, ' ');

    // 8. Strip standalone long numeric sequences (>= 9 digits: core banking refs, UTR, phone)
    workingLine = workingLine.replace(/\b\d{9,20}\b/g, ' ');

    // 9. Determine transaction direction
    let type: TransactionType = 'DEBIT';
    const isSalaryOrPayroll = /\b(?:salary|payroll|monthly\s*pay|sal\s*credit|accenture|tcs|infosys|wipro|cognizant|google|microsoft|amazon\s*dev)\b/i.test(line);
    const isIncomeKeyword = /\b(?:refund|cashback|reversal|interest\s*credit|dividend|credited|deposit|received\s*from)\b/i.test(line);
    const hasExplicitCredit = /(?<!credit\s+card|upi\/|card\s+)\b(CR|CREDIT)\b(?!\s*card)/i.test(workingLine);
    const hasExplicitDebit = /(?<!\w)(DR|DEBIT|debited|paid\s+to|spent\s+on|transferred\s+to|sent\s+to|withdrawal)\b/i.test(workingLine);

    if (hasExplicitCredit || isSalaryOrPayroll || isIncomeKeyword) {
      type = 'CREDIT';
    } else if (hasExplicitDebit) {
      type = 'DEBIT';
    }

    // 10. Extract candidate amounts with improved Indian and international comma support
    const amountRegex = /(?:(₹|Rs\.?|INR|\$)\s*)?([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
    const amountMatches: { value: number; raw: string; hasCurr: boolean; hasDec: boolean; index: number }[] = [];
    let m: RegExpExecArray | null;

    while ((m = amountRegex.exec(workingLine)) !== null) {
      const cleaned = m[2].replace(/,/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) {
        amountMatches.push({
          value: num,
          raw: m[0],
          hasCurr: !!m[1],
          hasDec: m[2].includes('.'),
          index: m.index,
        });
      }
    }

    if (amountMatches.length === 0) {
      return null;
    }

    // Filter out stray 4-digit years (e.g. 2024..2035) if other real candidates exist
    let candidates = amountMatches;
    if (candidates.length > 1) {
      const nonYearCandidates = candidates.filter(c => !(c.value >= 2020 && c.value <= 2035 && !c.hasDec && !c.hasCurr));
      if (nonYearCandidates.length > 0) {
        candidates = nonYearCandidates;
      }
    }

    let amount = 0;
    let balance = explicitBalance;

    if (explicitBalance !== undefined) {
      // Balance was already explicitly identified; pick amount from remaining candidates
      const currMatch = candidates.find(c => c.hasCurr);
      const decMatch = candidates.find(c => c.hasDec);
      amount = (currMatch || decMatch || candidates[0]).value;
    } else if (candidates.length === 1) {
      amount = candidates[0].value;
    } else if (candidates.length === 2) {
      // Check if one has currency symbol
      if (candidates[0].hasCurr && !candidates[1].hasCurr) {
        amount = candidates[0].value;
        balance = candidates[1].value;
      } else {
        // Standard bank statement [Withdrawal/Deposit Amount, Running Balance]
        amount = candidates[0].value;
        balance = candidates[1].value;
      }
    } else {
      // 3 or more candidates: rightmost is running balance
      balance = candidates[candidates.length - 1].value;
      const amountCandidates = candidates.slice(0, candidates.length - 1);
      const currMatch = amountCandidates.find(c => c.hasCurr);
      const decMatch = amountCandidates.find(c => c.hasDec);
      amount = (currMatch || decMatch || amountCandidates[amountCandidates.length - 1]).value;
    }

    // Extract description by removing amounts and CR/DR flags
    let description = workingLine;
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
