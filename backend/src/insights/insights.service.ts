import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';

export type InsightType =
  | 'SUBSCRIPTION_AUDIT'
  | 'WEEKEND_SPIKE'
  | 'MERCHANT_IMPACT'
  | 'UTILITY_ALERT'
  | 'SAVINGS_RATE';

export interface FinancialInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  icon: string;
  metric?: string;
  value?: number;
  actionableTip?: string;
  generatedAt: string;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recurringService: RecurringService,
  ) {}

  /**
   * Generate comprehensive feed of actionable proactive insights.
   */
  async getInsightsFeed(userId: string): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    try {
      // 1. Subscription Audit
      const subInsight = await this.generateSubscriptionAudit(userId);
      if (subInsight) insights.push(subInsight);

      // 2. Savings Rate Tracker
      const savingsInsight = await this.generateSavingsRateInsight(userId);
      if (savingsInsight) insights.push(savingsInsight);

      // 3. Weekend Spike Detector
      const weekendInsight = await this.generateWeekendSpikeInsight(userId);
      if (weekendInsight) insights.push(weekendInsight);

      // 4. Top Merchant Impact (Annualized)
      const merchantInsight = await this.generateMerchantImpactInsight(userId);
      if (merchantInsight) insights.push(merchantInsight);

      // 5. Utility Bill Alert
      const utilityInsight = await this.generateUtilityTrendInsight(userId);
      if (utilityInsight) insights.push(utilityInsight);
    } catch (error) {
      this.logger.error('Error generating financial insights:', error);
    }

    return insights;
  }

  private async generateSubscriptionAudit(userId: string): Promise<FinancialInsight | null> {
    const rec = await this.recurringService.getRecurring(userId);
    if (!rec || rec.summary.activeCount === 0 || rec.summary.totalMonthlyCommitment === 0) {
      return null;
    }

    const monthly = rec.summary.totalMonthlyCommitment;
    const count = rec.summary.activeCount;
    const annualized = monthly * 12;

    return {
      id: `sub-audit-${userId}`,
      type: 'SUBSCRIPTION_AUDIT',
      title: 'Recurring Commitment Audit',
      description: `You are committed to ₹${monthly.toLocaleString()}/month across ${count} active recurring subscriptions (Annualized: ₹${annualized.toLocaleString()}/year).`,
      severity: monthly > 5000 ? 'WARNING' : 'INFO',
      icon: 'CreditCard',
      metric: `₹${monthly.toLocaleString()}/mo`,
      value: monthly,
      actionableTip: 'Review your recurring subscriptions to eliminate unused memberships and save monthly.',
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateSavingsRateInsight(userId: string): Promise<FinancialInsight | null> {
    const now = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        isDuplicate: false,
        txnDate: { gte: sixtyDaysAgo, lte: now },
      },
    });

    if (txns.length === 0) return null;

    let income = 0;
    let expenses = 0;

    for (const t of txns) {
      const val = Math.abs(Number(t.amountSigned));
      if (t.direction === 'CREDIT') income += val;
      else expenses += val;
    }

    if (income === 0) return null;

    const net = income - expenses;
    const rate = Math.round((net / income) * 100);

    let severity: 'SUCCESS' | 'INFO' | 'WARNING' | 'ALERT' = 'INFO';
    let tip = 'Continue tracking discretionary expenses to build a 6-month emergency reserve.';

    if (rate >= 35) {
      severity = 'SUCCESS';
      tip = 'Great financial health! Consider allocating surplus cash flow to high-yield investments.';
    } else if (rate >= 15) {
      severity = 'INFO';
      tip = 'Aim to increase your savings rate to 20-30% by capping dining and entertainment.';
    } else if (rate > 0) {
      severity = 'WARNING';
      tip = 'Your expenses are consuming over 85% of your income. Review top categories to free up cash.';
    } else {
      severity = 'ALERT';
      tip = 'You are currently spending more than your income. Review your recent transactions to avoid debt.';
    }

    return {
      id: `savings-rate-${userId}`,
      type: 'SAVINGS_RATE',
      title: rate >= 0 ? `Net Savings Rate: ${rate}%` : `Negative Cash Flow: ${rate}%`,
      description: `In the past 60 days, you earned ₹${income.toLocaleString()} and spent ₹${expenses.toLocaleString()} (Net: ${net >= 0 ? '+' : ''}₹${net.toLocaleString()}).`,
      severity,
      icon: 'PiggyBank',
      metric: `${rate}%`,
      value: rate,
      actionableTip: tip,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateWeekendSpikeInsight(userId: string): Promise<FinancialInsight | null> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        direction: 'DEBIT',
        isDuplicate: false,
        txnDate: { gte: ninetyDaysAgo },
      },
    });

    if (txns.length < 10) return null;

    let weekendSpend = 0;
    let weekendDaysCount = 0;
    let weekdaySpend = 0;
    let weekdayDaysCount = 0;

    for (const t of txns) {
      const day = t.txnDate.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday=0, Saturday=6
      const val = Math.abs(Number(t.amountSigned));

      if (isWeekend) {
        weekendSpend += val;
        weekendDaysCount++;
      } else {
        weekdaySpend += val;
        weekdayDaysCount++;
      }
    }

    const weekendAvg = weekendSpend / (weekendDaysCount || 1);
    const weekdayAvg = weekdaySpend / (weekdayDaysCount || 1);

    if (weekdayAvg > 0 && weekendAvg > weekdayAvg * 1.3) {
      const pctHigher = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);

      return {
        id: `weekend-spike-${userId}`,
        type: 'WEEKEND_SPIKE',
        title: 'Weekend Spending Spike Detected',
        description: `Your average weekend transaction spend (₹${Math.round(weekendAvg).toLocaleString()}) is ${pctHigher}% higher than weekdays (₹${Math.round(weekdayAvg).toLocaleString()}).`,
        severity: 'WARNING',
        icon: 'Flame',
        metric: `+${pctHigher}%`,
        value: pctHigher,
        actionableTip: 'Create a dedicated weekend entertainment budget to keep discretionary impulses in check.',
        generatedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  private async generateMerchantImpactInsight(userId: string): Promise<FinancialInsight | null> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        direction: 'DEBIT',
        isDuplicate: false,
        txnDate: { gte: ninetyDaysAgo },
      },
    });

    if (txns.length < 5) return null;

    const merchantSpend = new Map<string, number>();
    for (const t of txns) {
      const name = (t.normalizedDescription || t.description || '').trim();
      if (!name) continue;
      const val = Math.abs(Number(t.amountSigned));
      merchantSpend.set(name, (merchantSpend.get(name) || 0) + val);
    }

    const sorted = Array.from(merchantSpend.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;

    const [topMerchant, total90] = sorted[0];
    const monthlyRate = Math.round(total90 / 3);
    const annualized = monthlyRate * 12;

    if (annualized >= 15000) {
      return {
        id: `merchant-impact-${userId}`,
        type: 'MERCHANT_IMPACT',
        title: `Annualized Spend: ${topMerchant}`,
        description: `At ₹${monthlyRate.toLocaleString()}/month on ${topMerchant}, your annualized projection is ₹${annualized.toLocaleString()} per year.`,
        severity: 'INFO',
        icon: 'TrendingUp',
        metric: `₹${annualized.toLocaleString()}/yr`,
        value: annualized,
        actionableTip: `Reducing your ${topMerchant} spend by 15% could put over ₹${Math.round(annualized * 0.15).toLocaleString()} back in your pocket each year.`,
        generatedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  private async generateUtilityTrendInsight(userId: string): Promise<FinancialInsight | null> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        direction: 'DEBIT',
        isDuplicate: false,
        txnDate: { gte: prevMonthStart },
      },
      include: { category: true },
    });

    const isUtility = (t: any) => {
      const c = (t.category?.name || '').toLowerCase();
      const d = (t.normalizedDescription || t.description || '').toLowerCase();
      return (
        c.includes('utilit') ||
        d.includes('bescom') ||
        d.includes('electricity') ||
        d.includes('broadband') ||
        d.includes('airtel') ||
        d.includes('jio') ||
        d.includes('gas')
      );
    };

    let prevSpend = 0;
    let currSpend = 0;

    for (const t of txns) {
      if (!isUtility(t)) continue;
      const val = Math.abs(Number(t.amountSigned));
      if (t.txnDate >= currentMonthStart) {
        currSpend += val;
      } else {
        prevSpend += val;
      }
    }

    if (prevSpend > 1000 && currSpend > prevSpend * 1.2) {
      const pctIncrease = Math.round(((currSpend - prevSpend) / prevSpend) * 100);

      return {
        id: `utility-alert-${userId}`,
        type: 'UTILITY_ALERT',
        title: `Utility Bills Rose by ${pctIncrease}%`,
        description: `Your utility expenses rose from ₹${Math.round(prevSpend).toLocaleString()} last month to ₹${Math.round(currSpend).toLocaleString()} this month.`,
        severity: 'WARNING',
        icon: 'Zap',
        metric: `+${pctIncrease}%`,
        value: pctIncrease,
        actionableTip: 'Review your electricity and telecom usage to identify unexpected surge rates or subscriptions.',
        generatedAt: new Date().toISOString(),
      };
    }

    return null;
  }
}
