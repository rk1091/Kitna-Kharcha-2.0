import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  transaction: {
    findMany: vi.fn(),
  },
  recurringGroup: {
    findMany: vi.fn(),
  },
};

describe('ExportService (Task E1)', () => {
  let service: ExportService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExportService(mockPrismaService as unknown as PrismaService);
  });

  it('should export transactions as CSV string with proper escaping', async () => {
    mockPrismaService.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-01-15T10:00:00Z'),
        description: 'Swiggy, Bangalore',
        normalizedDescription: 'Swiggy',
        direction: 'DEBIT',
        amountSigned: -450,
        debitAmount: 450,
        creditAmount: null,
        currency: 'INR',
        tags: ['food', 'delivery'],
        category: { name: 'Food & Dining' },
        statement: { bankName: 'HDFC Bank' },
      },
    ]);

    const csv = await service.exportCSV('user-1', {});
    expect(csv).toContain('Date,Description,Normalized Merchant,Category,Tags,Direction,Amount,Currency,Bank');
    expect(csv).toContain('"Swiggy, Bangalore"');
    expect(csv).toContain('Food & Dining');
    expect(csv).toContain('450.00');
    expect(csv).toContain('HDFC Bank');
  });

  it('should export transactions as Excel XLSX buffer', async () => {
    mockPrismaService.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-01-15T10:00:00Z'),
        description: 'Salary',
        normalizedDescription: 'Salary Credit',
        direction: 'CREDIT',
        amountSigned: 75000,
        debitAmount: null,
        creditAmount: 75000,
        currency: 'INR',
        tags: ['salary'],
        category: { name: 'Income' },
        statement: { bankName: 'SBI Bank' },
      },
    ]);

    const buffer = await service.exportExcel('user-1', {});
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should generate printable executive summary HTML report', async () => {
    mockPrismaService.transaction.findMany.mockResolvedValue([
      {
        txnDate: new Date('2026-01-15T10:00:00Z'),
        description: 'Swiggy',
        normalizedDescription: 'Swiggy',
        direction: 'DEBIT',
        amountSigned: -450,
        category: { name: 'Food' },
      },
      {
        txnDate: new Date('2026-01-01T10:00:00Z'),
        description: 'Salary',
        normalizedDescription: 'Company',
        direction: 'CREDIT',
        amountSigned: 100000,
        category: { name: 'Income' },
      },
    ]);

    mockPrismaService.recurringGroup.findMany.mockResolvedValue([
      {
        avgAmount: 999,
        isActive: true,
      },
    ]);

    const report = await service.exportExecutiveReport('user-1', {});
    expect(report).toContain('Kitna Kharcha — Financial Executive Summary');
    expect(report).toContain('Total Outflow');
    expect(report).toContain('Total Inflow');
    expect(report).toContain('Swiggy');
    expect(report).toContain('Food');
  });
});
