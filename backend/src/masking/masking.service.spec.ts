import { describe, it, expect, beforeEach } from 'vitest';
import { MaskingService } from './masking.service';
import { PIIType } from './interfaces/masking.interface';

describe('MaskingService', () => {
  let service: MaskingService;

  beforeEach(() => {
    service = new MaskingService();
  });

  it('should mask PAN correctly', () => {
    const text = 'My PAN is ABCDE1234F.';
    const result = service.maskSync(text);
    expect(result.maskedText).toBe('My PAN is [PAN].');
    expect(result.report[0].type).toBe(PIIType.PAN);
  });

  it('should encrypt masking correctly when key is provided', async () => {
    const text = 'My PAN is ABCDE1234F.';
    const key = '12345678901234567890123456789012'; // 32 bytes
    const result = await service.mask(text, key);
    
    expect(result.maskedText).not.toContain('ABCDE1234F');
    expect(result.maskedText).not.toContain('[PAN]');
    expect(result.encryptedMapping).toBeDefined();
    
    // The masked text should contain the mapped token
    const token = Object.keys(result.encryptedMapping!)[0];
    expect(result.maskedText).toContain(token);
  });

  it('should handle overlapping matches by keeping the longer match or prior match', () => {
    // UPI ID looks like an email as well.
    // user@upi and user@email.com
    const text = 'My upi is testuser@okicici';
    const result = service.maskSync(text);
    // Usually UPI ID might overlap with email strategy. Deduplication should handle it gracefully without crashing.
    expect(result.report.length).toBeGreaterThan(0);
    expect(result.maskedText).not.toContain('testuser@okicici');
  });

  it('should mask multiple types in one text', () => {
    const text = 'Paid to Rahul Kumar balance Rs 5000 from a/c 1234567890';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[BENEFICIARY]');
    expect(result.maskedText).toContain('[BALANCE]');
    expect(result.maskedText).toContain('[ACCOUNT_NUMBER]');
  });
});
