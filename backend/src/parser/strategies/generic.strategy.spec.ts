import { describe, it, expect, beforeEach } from 'vitest';
import { GenericStrategy } from './generic.strategy';
import { MerchantNormalizer } from '../merchant/merchant-normalizer';

describe('GenericStrategy', () => {
  let strategy: GenericStrategy;
  let normalizer: MerchantNormalizer;

  beforeEach(() => {
    normalizer = new MerchantNormalizer();
    strategy = new GenericStrategy(normalizer);
  });

  it('should parse DD/MM/YYYY format with amounts and running balances', async () => {
    const text = `
      Account Statement for Axis Bank
      Date Particulars Withdrawal Deposit Balance
      15/01/2026 SWIGGY BANGALORE IN 450.00 Dr 1,84,970.50
      16/01/2026 UBER INDIA HYDERABAD 320.00 1,84,650.50
    `;

    const result = await strategy.parse(text);
    expect(result.healthScore).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].type).toBe('DEBIT');
    expect(result.transactions[0].merchantName).toBe('Swiggy');
    expect(result.transactions[0].balance).toBe(184970.5);
  });

  it('should auto-detect salary credits deterministically as CREDIT', async () => {
    const text = `
      Transaction History
      Date | Narration | Amount | Balance
      01-02-2026 | Accenture Solutions Pvt Ltd Monthly Pay | 85,000.00 | 2,15,000.00
      02-02-2026 | Interest Credit Q4 | 1,250.00 | 2,16,250.00
    `;

    const result = await strategy.parse(text);
    expect(result.healthScore).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(85000);
    expect(result.transactions[0].type).toBe('CREDIT');
    expect(result.transactions[1].amount).toBe(1250);
    expect(result.transactions[1].type).toBe('CREDIT');
  });

  it('should parse DD-Mon-YYYY and YYYY-MM-DD date formats', async () => {
    const text = `
      15 Jan 2026 NETFLIX ENTERTAINMENT 649.00 50,000.00
      2026-01-20 ZOMATO RESTAURANT 890.00 49,110.00
    `;

    const result = await strategy.parse(text);
    expect(result.healthScore).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].merchantName).toBe('Netflix');
    expect(result.transactions[1].merchantName).toBe('Zomato');
  });

  it('should return healthScore 0 for empty or unparseable input', async () => {
    const result = await strategy.parse('Random unparseable string with no dates or numbers');
    expect(result.healthScore).toBe(0);
    expect(result.transactions).toHaveLength(0);
  });

  it('should parse comma-formatted amounts without decimals correctly', async () => {
    const text = `
      15/01/2026 LAPTOP STORE 12,500 80,000
      01-02-2026 TCS SALARY CREDIT 1,50,000 2,30,000
    `;

    const result = await strategy.parse(text);
    expect(result.healthScore).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(12500);
    expect(result.transactions[0].balance).toBe(80000);
    expect(result.transactions[0].type).toBe('DEBIT');

    expect(result.transactions[1].amount).toBe(150000);
    expect(result.transactions[1].balance).toBe(230000);
    expect(result.transactions[1].type).toBe('CREDIT');
  });

  it('should ignore cheque numbers, value dates, and UPI reference IDs when picking the amount', async () => {
    const text = `
      02/01/2026 UPI-SWIGGY-402918237192-PAYMENT 000000000452 02/01/2026 450.00 25,000.00
      03/01/2026 UBER INDIA 984021 320.00 24,680.00
    `;

    const result = await strategy.parse(text);
    expect(result.healthScore).toBe(100);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].balance).toBe(25000);
    expect(result.transactions[0].merchantName).toBe('Swiggy');

    expect(result.transactions[1].amount).toBe(320);
    expect(result.transactions[1].balance).toBe(24680);
    expect(result.transactions[1].merchantName).toBe('Uber');
  });

  it('should correctly parse bank alert SMS and extract amount, balance, and merchant', async () => {
    const text = `
      Dear SBI User, your A/c ending 1234 has been debited by Rs. 450.00 on 15-Jan-2026 via UPI to SWIGGY. Avail Bal: Rs 15,420.50 - SBI
      Sent Rs.500.00 from Kotak Bank AC X1234 to UBER on 12-01-2026. Ref 402918237182. Bal Rs.25,000.00
    `;

    const result = await strategy.parse(text);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].balance).toBe(15420.5);
    expect(result.transactions[0].type).toBe('DEBIT');
    expect(result.transactions[0].merchantName).toBe('Swiggy');

    expect(result.transactions[1].amount).toBe(500);
    expect(result.transactions[1].balance).toBe(25000);
    expect(result.transactions[1].type).toBe('DEBIT');
    expect(result.transactions[1].merchantName).toBe('Uber');
  });

  it('should parse credit card statements with order numbers and no balance column', async () => {
    const text = `
      15/01/2026 SWIGGY ORDER 982341 450.00
    `;

    const result = await strategy.parse(text);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].balance).toBeUndefined();
  });

  it('should not misclassify UPI CR references as credit transactions', async () => {
    const text = `
      15/01/2026 UPI/CR/402918237192/SWIGGY 450.00 25,000.00
    `;

    const result = await strategy.parse(text);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].type).toBe('DEBIT');
  });
});
