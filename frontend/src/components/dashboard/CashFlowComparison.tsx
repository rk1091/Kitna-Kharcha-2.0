import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Wallet, ArrowDownLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface CashFlowTransaction {
  id: string;
  txnDate: string;
  description: string;
  normalizedDescription?: string;
  amountSigned: string | number;
  direction: 'CREDIT' | 'DEBIT';
  category?: { id: string; name: string } | null;
}

interface CashFlowComparisonProps {
  transactions: CashFlowTransaction[];
}

interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  timestamp: number;
}

interface IncomeSource {
  source: string;
  amount: number;
  percentage: number;
  count: number;
}

export const CashFlowComparison: React.FC<CashFlowComparisonProps> = ({ transactions }) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [activeTab, setActiveTab] = useState<'flow' | 'sources'>('flow');

  // Compute Monthly Cash Flow buckets
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number; timestamp: number }> = {};

    transactions.forEach((t) => {
      const d = new Date(t.txnDate);
      if (isNaN(d.getTime())) return;

      const monthKey = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();

      if (!map[monthKey]) {
        map[monthKey] = { income: 0, expense: 0, timestamp: monthStart };
      }

      const amt = Math.abs(Number(t.amountSigned) || 0);
      if (t.direction === 'CREDIT') {
        map[monthKey].income += amt;
      } else {
        map[monthKey].expense += amt;
      }
    });

    return Object.entries(map)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .map(([month, data]) => {
        const net = data.income - data.expense;
        const rate = data.income > 0 ? (net / data.income) * 100 : 0;
        return {
          month,
          income: Math.round(data.income),
          expense: Math.round(data.expense),
          net: Math.round(net),
          savingsRate: Number(rate.toFixed(1)),
          timestamp: data.timestamp,
        } as MonthlyCashFlow;
      });
  }, [transactions]);

  // Overall Income, Expense & Savings Rate
  const { totalIncome, totalExpense, netSavings, overallSavingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const amt = Math.abs(Number(t.amountSigned) || 0);
      if (t.direction === 'CREDIT') {
        income += amt;
      } else {
        expense += amt;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? (net / income) * 100 : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      overallSavingsRate: Number(rate.toFixed(1)),
    };
  }, [transactions]);

  // Credit Sources Breakdown
  const incomeSources = useMemo(() => {
    const sourceMap: Record<string, { amount: number; count: number }> = {};

    transactions
      .filter((t) => t.direction === 'CREDIT')
      .forEach((t) => {
        const name =
          t.category?.name ||
          t.normalizedDescription ||
          'Other Credits';

        const amt = Math.abs(Number(t.amountSigned) || 0);
        if (!sourceMap[name]) {
          sourceMap[name] = { amount: 0, count: 0 };
        }
        sourceMap[name].amount += amt;
        sourceMap[name].count += 1;
      });

    return Object.entries(sourceMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([source, data]) => ({
        source,
        amount: data.amount,
        count: data.count,
        percentage: totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0,
      })) as IncomeSource[];
  }, [transactions, totalIncome]);

  const isNetPositive = netSavings >= 0;

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Cash Flow & Income Dynamics
            </CardTitle>
            <CardDescription className="text-xs">
              Income vs Expenses, Net Cash Flow, and Credit Source Breakdown
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('flow')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === 'flow'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cash Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === 'sources'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Income Sources ({incomeSources.length})
              </button>
            </div>

            {activeTab === 'flow' && (
              <button
                type="button"
                onClick={() => setChartType(chartType === 'bar' ? 'area' : 'bar')}
                className="text-[11px] text-primary hover:underline px-2 font-medium"
              >
                Switch to {chartType === 'bar' ? 'Area' : 'Bar'}
              </button>
            )}
          </div>
        </div>

        {/* Top Cash Flow KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Total Inflows</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ₹{Math.round(totalIncome).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">Total Outflows</span>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              ₹{Math.round(totalExpense).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-card border border-border">
            <span className="text-[10px] text-muted-foreground font-medium">Net Savings</span>
            <p
              className={`text-sm font-bold ${
                isNetPositive ? 'text-emerald-500' : 'text-destructive'
              }`}
            >
              {isNetPositive ? '+' : '-'}₹{Math.abs(Math.round(netSavings)).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-card border border-border">
            <span className="text-[10px] text-muted-foreground font-medium">Savings Rate</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-sm font-bold ${overallSavingsRate >= 20 ? 'text-emerald-500' : 'text-foreground'}`}>
                {overallSavingsRate}%
              </span>
              <Badge
                className={`text-[9px] px-1.5 py-0 ${
                  overallSavingsRate >= 30
                    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                    : overallSavingsRate >= 10
                    ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                }`}
              >
                {overallSavingsRate >= 30 ? 'Strong' : overallSavingsRate >= 10 ? 'Moderate' : 'Low'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {activeTab === 'flow' ? (
          <div className="h-[280px] w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="income" name="Income (Inflow)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense (Outflow)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fillOpacity={1} fill="url(#incomeGradient)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" fillOpacity={1} fill="url(#expenseGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
                <Wallet className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p>No monthly cash flow records available</p>
              </div>
            )}
          </div>
        ) : (
          /* Income Sources List */
          <div className="space-y-3">
            {incomeSources.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                <ArrowDownLeft className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p>No credit or income sources found in this period</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {incomeSources.map((item) => (
                  <div key={item.source} className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-foreground">{item.source}</span>
                        <span className="text-[10px] text-muted-foreground">({item.count} deposit{item.count > 1 ? 's' : ''})</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Math.round(item.amount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="shrink-0 font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
