import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CategoryVelocity {
  categoryId: string;
  categoryName: string;
  monthlySpend: Record<string, number>;
  averageMonthly: number;
  recentVelocity: number; // percentage change last month vs 3-month average
  trend: 'ACCELERATING' | 'DECELERATING' | 'STABLE';
}

export interface IncomeStability {
  score: number; // 0 to 100
  averageSalary: number;
  salaryCount: number;
  amountVariancePct: number;
  cadenceSummary: string;
}

export interface MerchantVelocityItem {
  merchant: string;
  currentPeriodSpend: number;
  previousPeriodSpend: number;
  deltaAmount: number;
  pctChange: number;
  trajectory: 'SURGING' | 'GROWING' | 'COOLING' | 'DROPPING' | 'NEW';
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Multi-period trend analysis: Category spend velocity, monthly buckets, and income stability.
   */
  async getTrends(userId: string, months: number = 6) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        isDuplicate: false,
        txnDate: { gte: cutoff },
      },
      include: { category: true },
      orderBy: { txnDate: 'asc' },
    });

    // 1. Monthly Buckets
    const monthlyBuckets = new Map<string, { income: number; expense: number; txnsCount: number }>();
    const monthKeys: string[] = [];

    // Pre-populate past N month keys in chronological order
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      monthKeys.push(key);
      monthlyBuckets.set(key, { income: 0, expense: 0, txnsCount: 0 });
    }

    // 2. Category Monthly Accumulation
    const categorySpend = new Map<string, { name: string; monthly: Record<string, number> }>();

    // 3. Salary / Income Transactions for Stability Analysis
    const salaryTxns: { date: Date; amount: number }[] = [];

    for (const t of txns) {
      const mKey = t.txnDate.toISOString().slice(0, 7);
      const val = Math.abs(Number(t.amountSigned));

      if (monthlyBuckets.has(mKey)) {
        const bucket = monthlyBuckets.get(mKey)!;
        bucket.txnsCount++;
        if (t.direction === 'CREDIT') {
          bucket.income += val;
        } else {
          bucket.expense += val;
        }
      }

      if (t.direction === 'DEBIT') {
        const catId = t.categoryId || 'uncategorized';
        const catName = t.category?.name || 'Uncategorized';
        if (!categorySpend.has(catId)) {
          categorySpend.set(catId, { name: catName, monthly: {} });
        }
        const entry = categorySpend.get(catId)!;
        entry.monthly[mKey] = (entry.monthly[mKey] || 0) + val;
      }

      // Check for salary / payroll credits
      const desc = (t.normalizedDescription || t.description || '').toLowerCase();
      if (t.direction === 'CREDIT' && (desc.includes('salary') || desc.includes('payroll') || val >= 25000)) {
        salaryTxns.push({ date: t.txnDate, amount: val });
      }
    }

    // Format category velocities
    const categoryVelocities: CategoryVelocity[] = [];
    const latestMonth = monthKeys[monthKeys.length - 1];
    const prevMonths = monthKeys.slice(0, monthKeys.length - 1);

    for (const [catId, data] of categorySpend.entries()) {
      let totalSpend = 0;
      for (const m of monthKeys) {
        totalSpend += data.monthly[m] || 0;
      }
      const avgMonthly = totalSpend / (monthKeys.length || 1);
      const latestSpend = data.monthly[latestMonth] || 0;

      const prevAvg = prevMonths.length > 0
        ? prevMonths.reduce((s, m) => s + (data.monthly[m] || 0), 0) / prevMonths.length
        : avgMonthly;

      const velocity = prevAvg > 0 ? Math.round(((latestSpend - prevAvg) / prevAvg) * 100) : 0;
      let trend: 'ACCELERATING' | 'DECELERATING' | 'STABLE' = 'STABLE';
      if (velocity > 15) trend = 'ACCELERATING';
      else if (velocity < -15) trend = 'DECELERATING';

      categoryVelocities.push({
        categoryId: catId,
        categoryName: data.name,
        monthlySpend: data.monthly,
        averageMonthly: Math.round(avgMonthly * 100) / 100,
        recentVelocity: velocity,
        trend,
      });
    }

    categoryVelocities.sort((a, b) => b.averageMonthly - a.averageMonthly);

    // Calculate income stability
    const incomeStability = this.computeIncomeStability(salaryTxns);

    return {
      monthlyTrends: monthKeys.map(key => {
        const b = monthlyBuckets.get(key)!;
        return {
          month: key,
          income: Math.round(b.income * 100) / 100,
          expense: Math.round(b.expense * 100) / 100,
          netSavings: Math.round((b.income - b.expense) * 100) / 100,
          transactionsCount: b.txnsCount,
        };
      }),
      categoryVelocities,
      incomeStability,
    };
  }

  /**
   * Merchant Velocity: Spend trajectories comparing last 30 days vs preceding 30 days.
   */
  async getMerchantVelocity(userId: string, topN: number = 10): Promise<MerchantVelocityItem[]> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const txns = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        direction: 'DEBIT',
        isDuplicate: false,
        txnDate: { gte: sixtyDaysAgo, lte: now },
      },
    });

    const currentMap = new Map<string, number>();
    const prevMap = new Map<string, number>();
    const allMerchants = new Set<string>();

    for (const t of txns) {
      const merchant = (t.normalizedDescription || t.description || 'Unknown').trim();
      allMerchants.add(merchant);
      const val = Math.abs(Number(t.amountSigned));

      if (t.txnDate >= thirtyDaysAgo) {
        currentMap.set(merchant, (currentMap.get(merchant) || 0) + val);
      } else {
        prevMap.set(merchant, (prevMap.get(merchant) || 0) + val);
      }
    }

    const items: MerchantVelocityItem[] = [];

    for (const m of allMerchants) {
      const curr = currentMap.get(m) || 0;
      const prev = prevMap.get(m) || 0;
      const delta = curr - prev;

      let pctChange = 0;
      let trajectory: 'SURGING' | 'GROWING' | 'COOLING' | 'DROPPING' | 'NEW' = 'COOLING';

      if (prev === 0 && curr > 0) {
        pctChange = 100;
        trajectory = 'NEW';
      } else if (prev > 0) {
        pctChange = Math.round((delta / prev) * 100);
        if (pctChange > 50) trajectory = 'SURGING';
        else if (pctChange > 10) trajectory = 'GROWING';
        else if (pctChange < -40) trajectory = 'DROPPING';
        else trajectory = 'COOLING';
      }

      if (curr > 0 || prev > 0) {
        items.push({
          merchant: m,
          currentPeriodSpend: Math.round(curr * 100) / 100,
          previousPeriodSpend: Math.round(prev * 100) / 100,
          deltaAmount: Math.round(delta * 100) / 100,
          pctChange,
          trajectory,
        });
      }
    }

    items.sort((a, b) => b.currentPeriodSpend - a.currentPeriodSpend);
    return items.slice(0, topN);
  }

  private computeIncomeStability(salaryTxns: { date: Date; amount: number }[]): IncomeStability {
    if (salaryTxns.length === 0) {
      return {
        score: 50,
        averageSalary: 0,
        salaryCount: 0,
        amountVariancePct: 0,
        cadenceSummary: 'No regular salary or primary income streams detected.',
      };
    }

    const amounts = salaryTxns.map(s => s.amount);
    const avgSalary = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const variancePct = avgSalary > 0 ? Math.round(((maxAmount - minAmount) / avgSalary) * 100) : 0;

    let score = 90;
    if (variancePct > 20) score -= 20;
    else if (variancePct > 10) score -= 10;

    if (salaryTxns.length < 2) score -= 15;

    return {
      score: Math.max(20, Math.min(100, score)),
      averageSalary: Math.round(avgSalary),
      salaryCount: salaryTxns.length,
      amountVariancePct: variancePct,
      cadenceSummary: salaryTxns.length >= 2
        ? `Consistent income detected (Avg ₹${Math.round(avgSalary).toLocaleString()} with ${variancePct}% variance).`
        : `Single primary deposit detected (₹${Math.round(avgSalary).toLocaleString()}).`,
    };
  }
}
