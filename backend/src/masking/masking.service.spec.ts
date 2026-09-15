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

  it('should mask HSN and SAC codes', () => {
    const text = 'Service Tax under SAC: 998314 and HSN 9983 for IT services';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[HSN]');
    expect(result.maskedText).not.toContain('998314');
  });

  it('should mask GSTIN correctly', () => {
    const text = 'Merchant GSTIN: 27AABCU9603R1ZM registered in Maharashtra';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[GSTIN]');
    expect(result.maskedText).not.toContain('27AABCU9603R1ZM');
  });

  it('should mask credit card tiers and product names', () => {
    const text = 'Statement for HDFC Regalia and ICICI Sapphiro, Infinia upgrade available';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[CARD_TIER_REDACTED]');
    expect(result.maskedText).not.toContain('Regalia');
    expect(result.maskedText).not.toContain('Sapphiro');
    expect(result.maskedText).not.toContain('Infinia');
  });

  it('should mask Customer ID / CIF and Nominee names', () => {
    const text = 'Cust ID: 9876543210. Nominee: Mrs Priya Sharma, relation: Spouse';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[CUSTOMER_ID]');
    expect(result.maskedText).toContain('[NOMINEE_REDACTED]');
    expect(result.maskedText).not.toContain('9876543210');
    expect(result.maskedText).not.toContain('Mrs Priya Sharma');
  });

  it('should mask Address prefixes and 6-digit Indian PIN codes', () => {
    const text = 'Mailing Address: Flat 402, Sunshine Apartment, Sector 14, Gurgaon 122001. PIN: 122001';
    const result = service.maskSync(text);
    expect(result.maskedText).toContain('[ADDRESS_REDACTED]');
    expect(result.maskedText).not.toContain('Flat 402');
    expect(result.maskedText).not.toContain('122001');
  });

  it('should mask comprehensive HDFC credit card statement with all PII types', () => {
    const hdfcStatement = `
      HDFC BANK CREDIT CARD STATEMENT
      Card Type: Infinia Credit Card
      Card Number: 4524 1234 5678 9010
      Customer ID: 1029384756
      Name: RAJESH KUMAR
      Address: Flat 301, Tower B, Phase 2, DLF Cyber City, Sector 25, Gurgaon 122002
      PAN: ABCDE1234F
      GSTIN: 07AAACH1234R1Z5
      HSN: 998314
      Nominee: Sunita Kumar
      Email: rajesh.kumar@gmail.com
      Phone: 9876543210
      Credit Limit: Rs 10,00,000.00
      Available Balance: Rs 8,50,000.00
    `;

    const result = service.maskSync(hdfcStatement);
    expect(result.maskedText).not.toContain('Infinia');
    expect(result.maskedText).not.toContain('4524 1234 5678 9010');
    expect(result.maskedText).not.toContain('1029384756');
    expect(result.maskedText).not.toContain('ABCDE1234F');
    expect(result.maskedText).not.toContain('07AAACH1234R1Z5');
    expect(result.maskedText).not.toContain('998314');
    expect(result.maskedText).not.toContain('Sunita Kumar');
    expect(result.maskedText).not.toContain('rajesh.kumar@gmail.com');
    expect(result.maskedText).not.toContain('9876543210');
    expect(result.report.length).toBeGreaterThanOrEqual(10);
  });
});

