import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Wallet, Receipt } from 'lucide-react';

export interface KPICardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  categorizedRatio: number;
  categorizedCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  transactionCount,
  categorizedRatio,
  categorizedCount,
}) => {
  const isNetPositive = netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Income
          </CardTitle>
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Total credited in selected period</p>
        </CardContent>
      </Card>

      {/* Total Expense */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Expenses
          </CardTitle>
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Total debited in selected period</p>
        </CardContent>
      </Card>

      {/* Net Cash Flow / Savings */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Net Savings
          </CardTitle>
          <div
            className={`p-1.5 rounded-md ${
              isNetPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold tracking-tight ${
              isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : '-'}₹
            {Math.abs(netSavings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isNetPositive ? 'Surplus cash flow' : 'Deficit / overspending'}
          </p>
        </CardContent>
      </Card>

      {/* Transaction Count & Categorization */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Transactions
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {categorizedRatio.toFixed(0)}% Categorized
            </Badge>
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {transactionCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {categorizedCount} of {transactionCount} classified
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
