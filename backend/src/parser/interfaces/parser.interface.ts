export type TransactionType = 'CREDIT' | 'DEBIT';

export interface ParsedTransaction {
  date: Date;
  amount: number;
  type: TransactionType;
  description: string;
  merchantName?: string;
  balance?: number;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  bankName: string;
  healthScore: number; // 0 to 100
  warnings: string[];
  errors: string[];
}

export interface BankParserStrategy {
  parse(text: string): Promise<ParseResult>;
}
