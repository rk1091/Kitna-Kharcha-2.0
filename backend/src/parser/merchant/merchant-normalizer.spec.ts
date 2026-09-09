import { describe, it, expect, beforeEach } from 'vitest';
import { MerchantNormalizer } from './merchant-normalizer';

describe('MerchantNormalizer', () => {
  let normalizer: MerchantNormalizer;

  beforeEach(() => {
    normalizer = new MerchantNormalizer();
  });

  it('should return the original name if no prefix is matched', () => {
    expect(normalizer.normalize('Amazon')).toBe('Amazon');
  });

  it('should strip UPI standard prefixes', () => {
    expect(normalizer.normalize('UPI/P2A/12345/M/s Zomato')).toBe('M/s Zomato');
    expect(normalizer.normalize('UPI/P2M/9876/Swiggy/HDFC')).toBe('Swiggy');
    expect(normalizer.normalize('UPI-12345-Uber')).toBe('Uber');
  });

  it('should strip NEFT standard prefixes', () => {
    expect(normalizer.normalize('NEFT-12345-Reliance')).toBe('Reliance');
    expect(normalizer.normalize('NEFT/4567/Tata Sky')).toBe('Tata Sky');
  });

  it('should strip IMPS standard prefixes', () => {
    expect(normalizer.normalize('IMPS-12345-Airtel')).toBe('Airtel');
    expect(normalizer.normalize('IMPS/0987/Jio')).toBe('Jio');
  });

  it('should strip multiple slash formats', () => {
    expect(normalizer.normalize('UPI/1234567890/Zomato/Oth')).toBe('Zomato');
  });

  it('should trim leading and trailing spaces', () => {
    expect(normalizer.normalize('  UPI/123/ Dominos  ')).toBe('Dominos');
  });
});
