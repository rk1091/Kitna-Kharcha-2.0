import { Injectable } from '@nestjs/common';
import { BankParserStrategy, ParseResult } from '../interfaces/parser.interface';
import { GenericStrategy } from './generic.strategy';

@Injectable()
export class SbiStrategy implements BankParserStrategy {
  constructor(private readonly genericStrategy: GenericStrategy) {}

  async parse(text: string): Promise<ParseResult> {
    const isSbi = /(?:state\s*bank\s*of\s*india|\bsbi\b)/i.test(text);
    if (!isSbi) {
      return {
        transactions: [],
        bankName: 'SBI',
        healthScore: 0,
        warnings: ['Text does not match SBI profile'],
        errors: [],
      };
    }

    const result = await this.genericStrategy.parse(text);
    return {
      ...result,
      bankName: 'SBI',
    };
  }
}

