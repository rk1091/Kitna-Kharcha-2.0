import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult } from '../interfaces/parser.interface';
import { GenericStrategy } from './generic.strategy';

@Injectable()
export class HdfcStrategy implements BankParserStrategy {
  constructor(private readonly genericStrategy: GenericStrategy) {}

  async parse(text: string): Promise<ParseResult> {
    const isHdfc = /(?:hdfc|housing development finance)/i.test(text);
    if (!isHdfc) {
      return {
        transactions: [],
        bankName: 'HDFC',
        healthScore: 0,
        warnings: ['Text does not match HDFC profile'],
        errors: [],
      };
    }

    const result = await this.genericStrategy.parse(text);
    return {
      ...result,
      bankName: 'HDFC',
    };
  }
}

