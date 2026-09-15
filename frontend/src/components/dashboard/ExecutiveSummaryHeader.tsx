import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UploadCloud, Calendar, Zap, PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ExecutiveSummaryHeaderProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  topCategoryName?: string;
  topCategoryPercentage?: number;
  topMerchantName?: string;
  dateRangeLabel?: string;
}

export const ExecutiveSummaryHeader: React.FC<ExecutiveSummaryHeaderProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  transactionCount,
  topCategoryName,
  topCategoryPercentage,
  topMerchantName,
  dateRangeLabel = 'all time',
}) => {
  const navigate = useNavigate();

  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Determine financial status badge
  let statusBadge = {
    label: 'On Track',
    variant: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };

  if (totalExpense > totalIncome && totalIncome > 0) {
    statusBadge = {
      label: 'Cash Flow Deficit',
      variant: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    };
  } else if (savingsRate < 15 && totalIncome > 0) {
    statusBadge = {
      label: 'Tight Margin',
      variant: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    };
  } else if (savingsRate >= 30) {
    statusBadge = {
      label: 'High Savings Rate',
      variant: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
    };
  }

  // Construct natural-language financial narrative
  const generateNarrative = () => {
    if (transactionCount === 0) {
      return 'No transactions recorded for this period. Upload a bank statement to activate automated classification and tiered AI insights.';
    }

    let narrative = `For ${dateRangeLabel}, you've logged `;
    narrative += `₹${Math.round(totalExpense).toLocaleString('en-IN')} in outflows across ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}. `;

    if (totalIncome > 0) {
      if (netSavings >= 0) {
        narrative += `Your net surplus is +₹${Math.round(netSavings).toLocaleString('en-IN')} (${savingsRate}% saved). `;
      } else {
        narrative += `You are in a deficit of -₹${Math.abs(Math.round(netSavings)).toLocaleString('en-IN')}. `;
      }
    }

    if (topCategoryName && topCategoryPercentage && topCategoryPercentage > 0) {
      narrative += `Your primary expenditure is ${topCategoryName} (${topCategoryPercentage.toFixed(0)}% of expenses)`;
      if (topMerchantName) {
        narrative += `, driven primarily by ${topMerchantName}.`;
      } else {
        narrative += '.';
      }
    }

    return narrative;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-6 shadow-sm">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
              <Sparkles className="h-3 w-3" />
              Executive Narrative
            </span>
            <Badge className={`text-[10px] ${statusBadge.variant}`}>
              {statusBadge.label}
            </Badge>
          </div>

          {/* Narrative Story */}
          <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
            {generateNarrative()}
          </p>

          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Computed with deterministic rules and tiered AI intelligence.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/upload')}
            className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/recurring')}
            className="h-8 text-xs font-medium gap-1.5 border-border hover:bg-muted"
          >
            <Zap className="h-3.5 w-3.5 text-purple-500" />
            <span>Subscriptions</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/budgets')}
            className="h-8 text-xs font-medium gap-1.5 border-border hover:bg-muted"
          >
            <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
            <span>Budgets</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
