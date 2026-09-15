import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let prismaMock: any;
  let recurringMock: any;

  beforeEach(() => {
    prismaMock = {
      transaction: {
        findMany: vi.fn(),
      },
    };

    recurringMock = {
      getRecurring: vi.fn(),
    };

    service = new InsightsService(
      prismaMock as unknown as PrismaService,
      recurringMock as unknown as RecurringService,
    );
  });

  it('should generate Subscription Audit insight when recurring commitment exists', async () => {
    recurringMock.getRecurring.mockResolvedValue({
      summary: {
        totalMonthlyCommitment: 2499,
        activeCount: 3,
      },
    });

    prismaMock.transaction.findMany.mockResolvedValue([]);

    const insights = await service.getInsightsFeed('user-1');
    const sub = insights.find(i => i.type === 'SUBSCRIPTION_AUDIT');

    expect(sub).toBeDefined();
    expect(sub?.value).toBe(2499);
    expect(sub?.metric).toContain('2,499');
    expect(sub?.description).toContain('3 active recurring subscriptions');
  });

  it('should generate Savings Rate insight for positive net cash flow', async () => {
    recurringMock.getRecurring.mockResolvedValue(null);

    prismaMock.transaction.findMany
      .mockResolvedValueOnce([
        { amountSigned: 100000, direction: 'CREDIT' },
        { amountSigned: -60000, direction: 'DEBIT' },
      ])
      .mockResolvedValue([]); // other queries

    const insights = await service.getInsightsFeed('user-1');
    const savings = insights.find(i => i.type === 'SAVINGS_RATE');

    expect(savings).toBeDefined();
    expect(savings?.value).toBe(40); // (100k - 60k) / 100k = 40%
    expect(savings?.severity).toBe('SUCCESS');
    expect(savings?.metric).toBe('40%');
  });

  it('should detect weekend spending spikes when weekend spend is 30%+ higher', async () => {
    recurringMock.getRecurring.mockResolvedValue(null);

    // Create 10 transactions: 4 on Saturday/Sunday (amount 2000), 6 on Monday-Friday (amount 500)
    const txns = [
      { txnDate: new Date('2026-02-07'), amountSigned: -2000, direction: 'DEBIT' }, // Saturday
      { txnDate: new Date('2026-02-08'), amountSigned: -2500, direction: 'DEBIT' }, // Sunday
      { txnDate: new Date('2026-02-14'), amountSigned: -2200, direction: 'DEBIT' }, // Saturday
      { txnDate: new Date('2026-02-15'), amountSigned: -2400, direction: 'DEBIT' }, // Sunday
      { txnDate: new Date('2026-02-02'), amountSigned: -500, direction: 'DEBIT' },  // Monday
      { txnDate: new Date('2026-02-03'), amountSigned: -600, direction: 'DEBIT' },  // Tuesday
      { txnDate: new Date('2026-02-04'), amountSigned: -450, direction: 'DEBIT' },  // Wednesday
      { txnDate: new Date('2026-02-05'), amountSigned: -550, direction: 'DEBIT' },  // Thursday
      { txnDate: new Date('2026-02-06'), amountSigned: -500, direction: 'DEBIT' },  // Friday
      { txnDate: new Date('2026-02-09'), amountSigned: -500, direction: 'DEBIT' },  // Monday
    ];

    prismaMock.transaction.findMany
      .mockResolvedValueOnce([]) // savings rate
      .mockResolvedValueOnce(txns) // weekend spike
      .mockResolvedValue([]); // rest

    const insights = await service.getInsightsFeed('user-1');
    const weekend = insights.find(i => i.type === 'WEEKEND_SPIKE');

    expect(weekend).toBeDefined();
    expect(weekend?.severity).toBe('WARNING');
    expect(weekend?.title).toContain('Weekend Spending Spike');
  });

  it('should generate Merchant Impact annualized projection', async () => {
    recurringMock.getRecurring.mockResolvedValue(null);

    const txns = [
      { normalizedDescription: 'Swiggy', amountSigned: -3000, direction: 'DEBIT' },
      { normalizedDescription: 'Swiggy', amountSigned: -4000, direction: 'DEBIT' },
      { normalizedDescription: 'Swiggy', amountSigned: -5000, direction: 'DEBIT' },
      { normalizedDescription: 'Uber', amountSigned: -500, direction: 'DEBIT' },
      { normalizedDescription: 'Uber', amountSigned: -600, direction: 'DEBIT' },
    ];

    prismaMock.transaction.findMany
      .mockResolvedValueOnce([]) // savings rate
      .mockResolvedValueOnce([]) // weekend spike
      .mockResolvedValueOnce(txns) // merchant impact
      .mockResolvedValue([]); // rest

    const insights = await service.getInsightsFeed('user-1');
    const merchant = insights.find(i => i.type === 'MERCHANT_IMPACT');

    expect(merchant).toBeDefined();
    expect(merchant?.title).toContain('Swiggy');
    // total 12000 in 90 days => 4000/mo => 48000/year
    expect(merchant?.value).toBe(48000);
  });
});
