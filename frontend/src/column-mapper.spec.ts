import { describe, it, expect } from 'vitest';
import {
  ColumnMapperModal,
  parseCSVPreview,
  detectColumnTarget,
  validateColumnMapping,
} from './components/upload/ColumnMapperModal';

describe('Interactive Column Mapping (Task D5)', () => {
  it('should export ColumnMapperModal component properly', () => {
    expect(ColumnMapperModal).toBeDefined();
    expect(typeof ColumnMapperModal).toBe('function');
  });

  it('should parse CSV preview into headers and up to 5 rows', () => {
    const csvContent = `Date,Narration,Withdrawal,Deposit,Balance
2026-01-01,"Swiggy Bangalore, IN",450.00,,12000.00
2026-01-02,"Salary Credit",,85000.00,97000.00
2026-01-03,"Uber Rides",220.50,,96779.50
2026-01-04,"Amazon India",1599.00,,95180.50
2026-01-05,"Airtel Broadband",1179.00,,94001.50
2026-01-06,"Zomato Dining",650.00,,93351.50`;

    const parsed = parseCSVPreview(csvContent, 5);
    expect(parsed.headers).toEqual(['Date', 'Narration', 'Withdrawal', 'Deposit', 'Balance']);
    expect(parsed.rows.length).toBe(5);
    expect(parsed.rows[0][0]).toBe('2026-01-01');
    expect(parsed.rows[0][1]).toBe('Swiggy Bangalore, IN');
    expect(parsed.rows[0][2]).toBe('450.00');
  });

  it('should automatically detect column targets from header heuristics', () => {
    expect(detectColumnTarget('Txn Date')).toBe('date');
    expect(detectColumnTarget('Value Date')).toBe('date');
    expect(detectColumnTarget('Narration / Description')).toBe('description');
    expect(detectColumnTarget('Particulars')).toBe('description');
    expect(detectColumnTarget('Withdrawal (Dr)')).toBe('debit');
    expect(detectColumnTarget('Deposit (Cr)')).toBe('credit');
    expect(detectColumnTarget('Closing Balance')).toBe('balance');
    expect(detectColumnTarget('Chq/Ref No.')).toBe('reference');
    expect(detectColumnTarget('Total Amount')).toBe('amount');
    expect(detectColumnTarget('Random Unknown Column')).toBe('ignore');
  });

  it('should validate mapping requirement of Date and Amount or Debit/Credit', () => {
    // Missing all required
    const invalidEmpty = validateColumnMapping({ 0: 'ignore', 1: 'description' });
    expect(invalidEmpty.isValid).toBe(false);
    expect(invalidEmpty.missingFields).toContain('Date');

    // Has Date but missing Amount
    const invalidNoAmount = validateColumnMapping({ 0: 'date', 1: 'description' });
    expect(invalidNoAmount.isValid).toBe(false);
    expect(invalidNoAmount.missingFields).toContain('Amount (or Debit/Credit)');

    // Has Date and Debit
    const validWithDebit = validateColumnMapping({ 0: 'date', 1: 'description', 2: 'debit' });
    expect(validWithDebit.isValid).toBe(true);
    expect(validWithDebit.missingFields.length).toBe(0);

    // Has Date and Single Amount
    const validWithAmount = validateColumnMapping({ 0: 'date', 1: 'amount' });
    expect(validWithAmount.isValid).toBe(true);
    expect(validWithAmount.missingFields.length).toBe(0);
  });
});
