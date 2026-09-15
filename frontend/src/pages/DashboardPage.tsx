import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UploadCloud, ChevronRight, Sparkles, Calendar, Receipt } from 'lucide-react';
import { KPICards } from '@/components/dashboard/KPICards';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { MonthlyTrendBar, MonthlyTrendData } from '@/components/dashboard/MonthlyTrendBar';
import { TopMerchantsList, TopMerchantItem } from '@/components/dashboard/TopMerchantsList';

interface Category {
  id: string;
  name: string;
  type?: string;
}

interface Transaction {
  id: string;
  txnDate: string;
  description: string;
  maskedDescription?: string;
  normalizedDescription?: string;
  amountSigned: string | number;
  currency: string;
  direction: 'CREDIT' | 'DEBIT';
  category: Category | null;
  categoryId: string | null;
  classificationReason?: string;
  tags?: string[];
}

type DateRangeOption = 'this_month' | '3_months' | 'ytd' | 'all_time';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeOption>('all_time');

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<Transaction[]>('/transactions')
      .then((res) => {
        if (isMounted) {
          setTransactions(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load transactions:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter transactions based on dateRange
  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all_time') return transactions;

    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.txnDate);
      if (isNaN(d.getTime())) return true;

      if (dateRange === 'this_month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (dateRange === '3_months') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return d >= ninetyDaysAgo;
      }
      if (dateRange === 'ytd') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return d >= startOfYear;
      }
      return true;
    });
  }, [transactions, dateRange]);

  // Aggregate KPI metrics
  const { totalIncome, totalExpense, netSavings, categorizedCount, categorizedRatio } =
    useMemo(() => {
      let income = 0;
      let expense = 0;
      let categorized = 0;

      filteredTransactions.forEach((t) => {
        const amt = Math.abs(Number(t.amountSigned) || 0);
        if (t.direction === 'CREDIT') {
          income += amt;
        } else {
          expense += amt;
        }

        if (t.category && t.classificationReason !== 'FALLBACK_UNCATEGORIZED') {
          categorized++;
        }
      });

      const ratio =
        filteredTransactions.length > 0 ? (categorized / filteredTransactions.length) * 100 : 0;

      return {
        totalIncome: income,
        totalExpense: expense,
        netSavings: income - expense,
        categorizedCount: categorized,
        categorizedRatio: ratio,
      };
    }, [filteredTransactions]);

  // Category chart distribution data
  const categoryChartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.direction === 'DEBIT')
      .forEach((t) => {
        const catName = t.category?.name || 'Uncategorized';
        const amt = Math.abs(Number(t.amountSigned) || 0);
        categoryMap[catName] = (categoryMap[catName] || 0) + amt;
      });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Monthly Trend Data
  const monthlyTrendData = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number; timestamp: number }> = {};

    // Group all or filtered transactions by month
    const sourceData = dateRange === 'this_month' ? transactions : filteredTransactions;

    sourceData.forEach((t) => {
      const d = new Date(t.txnDate);
      if (isNaN(d.getTime())) return;

      const monthKey = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0, timestamp: monthStart };
      }

      const amt = Math.abs(Number(t.amountSigned) || 0);
      if (t.direction === 'CREDIT') {
        monthMap[monthKey].income += amt;
      } else {
        monthMap[monthKey].expense += amt;
      }
    });

    return Object.entries(monthMap)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .map(([month, val]) => ({
        month,
        income: val.income,
        expense: val.expense,
      })) as MonthlyTrendData[];
  }, [transactions, filteredTransactions, dateRange]);

  // Top 10 Merchants by Spend
  const topMerchants = useMemo(() => {
    const merchantMap: Record<string, { totalSpent: number; count: number }> = {};

    filteredTransactions
      .filter((t) => t.direction === 'DEBIT')
      .forEach((t) => {
        const name =
          t.normalizedDescription ||
          (t.maskedDescription && !t.maskedDescription.includes('XXXX') ? t.maskedDescription : null) ||
          t.description ||
          'Unknown Merchant';

        const amt = Math.abs(Number(t.amountSigned) || 0);
        if (!merchantMap[name]) {
          merchantMap[name] = { totalSpent: 0, count: 0 };
        }
        merchantMap[name].totalSpent += amt;
        merchantMap[name].count += 1;
      });

    return Object.entries(merchantMap)
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 10)
      .map(([merchant, stat]) => ({
        merchant,
        totalSpent: stat.totalSpent,
        count: stat.count,
        percentageOfTotal: totalExpense > 0 ? (stat.totalSpent / totalExpense) * 100 : 0,
      })) as TopMerchantItem[];
  }, [filteredTransactions, totalExpense]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Kitna Kharcha Financial Analytics
            <Sparkles className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            100% local PII sanitization with deterministic rule matching and tiered AI intelligence.
          </p>
        </div>

        {/* Action Controls & Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            <button
              onClick={() => setDateRange('this_month')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === 'this_month'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('3_months')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === '3_months'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 3M
            </button>
            <button
              onClick={() => setDateRange('ytd')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === 'ytd'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              YTD
            </button>
            <button
              onClick={() => setDateRange('all_time')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                dateRange === 'all_time'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Time
            </button>
          </div>

          <Button size="sm" onClick={() => navigate('/upload')} className="gap-2 text-xs font-medium h-8">
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Statements</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <KPICards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        transactionCount={filteredTransactions.length}
        categorizedRatio={categorizedRatio}
        categorizedCount={categorizedCount}
      />

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-1">
          <CategoryPieChart data={categoryChartData} />
        </div>

        {/* Monthly Trend Bars */}
        <div className="lg:col-span-2">
          <MonthlyTrendBar data={monthlyTrendData} />
        </div>
      </div>

      {/* Top Merchants & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Merchants List */}
        <div className="lg:col-span-1">
          <TopMerchantsList merchants={topMerchants} totalExpense={totalExpense} />
        </div>

        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">
                Latest recorded activity in the current period
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-xs gap-1 text-primary hover:text-primary h-8"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Loading recent transactions...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p>No transactions found in this period</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 text-xs"
                  onClick={() => navigate('/upload')}
                >
                  Upload Statement
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-[11px]">Date</TableHead>
                      <TableHead className="text-[11px]">Merchant / Description</TableHead>
                      <TableHead className="text-[11px]">Category</TableHead>
                      <TableHead className="text-[11px] text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((t) => {
                      const isCredit = t.direction === 'CREDIT';
                      const merchantName =
                        t.normalizedDescription ||
                        (t.maskedDescription && !t.maskedDescription.includes('XXXX')
                          ? t.maskedDescription
                          : null) ||
                        t.description;

                      return (
                        <TableRow key={t.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                            {new Date(t.txnDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="text-foreground truncate max-w-[200px]">
                              {merchantName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={t.category ? 'secondary' : 'outline'}
                              className="text-[10px] font-medium"
                            >
                              {t.category ? t.category.name : 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold whitespace-nowrap ${
                              isCredit ? 'text-emerald-500' : 'text-foreground'
                            }`}
                          >
                            {isCredit ? '+' : '-'}₹
                            {Math.abs(Number(t.amountSigned) || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
