import { describe, it, expect, beforeEach } from 'vitest';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    service = new CurrencyService();
  });

  describe('detectCurrency', () => {
    it('should detect USD from $', () => {
      expect(service.detectCurrency('I spent $50')).toBe('USD');
    });

    it('should detect GBP from £', () => {
      expect(service.detectCurrency('£20 for food')).toBe('GBP');
    });

    it('should detect EUR from €', () => {
      expect(service.detectCurrency('Paid €15')).toBe('EUR');
    });

    it('should detect INR from ₹', () => {
      expect(service.detectCurrency('₹500 on auto')).toBe('INR');
    });

    it('should detect INR from Rs', () => {
      expect(service.detectCurrency('Rs 500')).toBe('INR');
    });

    it('should detect INR from INR', () => {
      expect(service.detectCurrency('500 INR')).toBe('INR');
    });

    it('should default to INR if no currency symbol is found', () => {
      expect(service.detectCurrency('spent 500 on dinner')).toBe('INR');
    });
  });

  describe('convertToBase', () => {
    it('should return the same amount if from and to currencies are the same', async () => {
      const result = await service.convertToBase(100, 'INR', 'INR');
      expect(result).toBe(100);
    });

    it('should convert USD to INR', async () => {
      const result = await service.convertToBase(10, 'USD', 'INR');
      expect(result).toBe(835); // 10 * 83.5
    });

    it('should convert GBP to INR', async () => {
      const result = await service.convertToBase(10, 'GBP', 'INR');
      expect(result).toBe(1052); // 10 * 105.2
    });

    it('should convert EUR to INR', async () => {
      const result = await service.convertToBase(10, 'EUR', 'INR');
      expect(result).toBe(901); // 10 * 90.1
    });

    it('should throw an error if conversion rate is unknown', async () => {
      await expect(service.convertToBase(10, 'JPY', 'INR')).rejects.toThrowError('Unknown conversion rate for JPY to INR');
    });
  });
});
