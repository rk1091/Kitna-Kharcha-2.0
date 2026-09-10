import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private readonly rates: Record<string, Record<string, number>> = {
    USD: { INR: 83.5 },
    GBP: { INR: 105.2 },
    EUR: { INR: 90.1 },
  };

  detectCurrency(text: string): string {
    if (/\$/.test(text)) return 'USD';
    if (/£/.test(text)) return 'GBP';
    if (/€/.test(text)) return 'EUR';
    if (/₹|Rs|INR/i.test(text)) return 'INR';
    
    return 'INR'; // Default
  }

  async convertToBase(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = this.rates[fromCurrency]?.[toCurrency];
    if (!rate) {
      throw new Error(`Unknown conversion rate for ${fromCurrency} to ${toCurrency}`);
    }

    return amount * rate;
  }
}
