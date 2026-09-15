import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Receipt, UploadCloud, ChevronRight, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  txnDate: string;
  description: string;
  maskedDescription: string;
  normalizedDescription?: string;
  amountSigned: string;
  currency: string;
  direction: 'CREDIT' | 'DEBIT';
  category: Category | null;
  categoryId: string | null;
  classificationReason: string;
  tags: string[];
}

const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/transactions')
      .then((res) => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalExpense = transactions
    .filter((t) => t.direction === 'DEBIT')
    .reduce((acc, curr) => acc + Math.abs(Number(curr.amountSigned)), 0);

  const totalIncome = transactions
    .filter((t) => t.direction === 'CREDIT')
    .reduce((acc, curr) => acc + Math.abs(Number(curr.amountSigned)), 0);

  const categorizedCount = transactions.filter(
    (t) => t.classificationReason !== 'FALLBACK_UNCATEGORIZED',
  ).length;
  const categorizedRatio = transactions.length > 0 ? (categorizedCount / transactions.length) * 100 : 0;

  // Chart aggregation
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.direction === 'DEBIT')
    .forEach((t) => {
      const catName = t.category ? t.category.name : 'Uncategorized';
      categoryMap[catName] = (categoryMap[catName] || 0) + Math.abs(Number(t.amountSigned));
    });

  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome to Kitna Kharcha 2.0
            <Sparkles className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your bank statements are parsed with 100% local PII masking before tiered AI classification.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => navigate('/upload')} className="gap-2 text-xs font-medium">
            <UploadCloud className="h-3.5 w-3.5" />
            Upload Statements
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total debited this cycle</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total credited this cycle</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Auto-Categorized
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-semibold">
              Rules + AI
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {categorizedRatio.toFixed(0)}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {categorizedCount} of {transactions.length} categorized
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transactions
            </CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {transactions.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all uploaded statements</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Spending by Category</CardTitle>
            <CardDescription className="text-xs">Expense allocation across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [
                        `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                        'Amount',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-muted-foreground">
                  <p>No expense data available</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">Upload a statement to visualize breakdown</p>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto pr-1">
              {chartData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-foreground truncate">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">
                    ₹{entry.value.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">Latest recorded activity across all statements</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-xs gap-1 text-primary hover:text-primary"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading recent transactions...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p>No transactions found</p>
                <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => navigate('/upload')}>
                  Upload First Statement
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-[11px]">Date</TableHead>
                      <TableHead className="text-[11px]">Description / Merchant</TableHead>
                      <TableHead className="text-[11px]">Category</TableHead>
                      <TableHead className="text-[11px] text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((t) => {
                      const isCredit = t.direction === 'CREDIT';
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
                              {t.normalizedDescription || t.maskedDescription || t.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.category ? 'secondary' : 'outline'} className="text-[10px] font-medium">
                              {t.category ? t.category.name : 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold whitespace-nowrap ${
                              isCredit ? 'text-emerald-500' : 'text-foreground'
                            }`}
                          >
                            {isCredit ? '+' : '-'}₹
                            {Math.abs(Number(t.amountSigned)).toLocaleString('en-IN', {
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
