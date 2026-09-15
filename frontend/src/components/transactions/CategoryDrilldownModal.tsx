import React, { useMemo } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Layers,
  ShoppingBag,
  TrendingUp,
  Receipt,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryDrilldownModalProps {
  categoryName: string | null;
  isOpen: boolean;
  onClose: () => void;
  transactions: Array<{
    id: string;
    txnDate: string;
    description: string;
    normalizedDescription?: string;
    maskedDescription?: string;
    amountSigned: string | number;
    direction: 'CREDIT' | 'DEBIT';
    category?: { name: string; id?: string } | null;
  }>;
}

export const CategoryDrilldownModal: React.FC<CategoryDrilldownModalProps> = ({
  categoryName,
  isOpen,
  onClose,
  transactions,
}) => {
  const navigate = useNavigate();

  // Filter transactions belonging to this category
  const categoryTxns = useMemo(() => {
    if (!categoryName) return [];
    return transactions.filter(
      (t) =>
        t.direction === 'DEBIT' &&
        (t.category?.name === categoryName || (!t.category && categoryName === 'Uncategorized')),
    );
  }, [transactions, categoryName]);

  // Aggregate metrics
  const { totalSpent, avgSpend, maxSpend, count, topMerchants } = useMemo(() => {
    let sum = 0;
    let max = 0;
    const merchantMap: Record<string, number> = {};

    categoryTxns.forEach((t) => {
      const amt = Math.abs(Number(t.amountSigned) || 0);
      sum += amt;
      if (amt > max) max = amt;

      const mName =
        t.normalizedDescription ||
        (t.maskedDescription && !t.maskedDescription.includes('XXXX')
          ? t.maskedDescription
          : null) ||
        t.description;

      merchantMap[mName] = (merchantMap[mName] || 0) + amt;
    });

    const merchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .map(([merchant, spent]) => ({
        merchant,
        spent,
        percentage: sum > 0 ? (spent / sum) * 100 : 0,
      }));

    return {
      totalSpent: sum,
      avgSpend: categoryTxns.length > 0 ? sum / categoryTxns.length : 0,
      maxSpend: max,
      count: categoryTxns.length,
      topMerchants: merchants,
    };
  }, [categoryTxns]);

  if (!isOpen || !categoryName) return null;

  const handleCreateRule = (merchant: string) => {
    navigate(`/rules?prefill=${encodeURIComponent(merchant)}&category=${encodeURIComponent(categoryName)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{categoryName}</span>
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {count} transaction{count === 1 ? '' : 's'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Category distribution, merchant ranking, and timeline
                </CardDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Total Spent</span>
                <p className="text-base font-bold text-foreground mt-0.5">
                  ₹{Math.round(totalSpent).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Avg Ticket Size</span>
                <p className="text-base font-bold text-foreground mt-0.5">
                  ₹{Math.round(avgSpend).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] text-muted-foreground">Highest Spend</span>
                <p className="text-base font-bold text-foreground mt-0.5">
                  ₹{Math.round(maxSpend).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Top Merchants in this Category */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                Top Merchants ({topMerchants.length})
              </h4>

              {topMerchants.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No merchant data recorded.</p>
              ) : (
                <div className="space-y-2">
                  {topMerchants.slice(0, 6).map((m) => (
                    <div
                      key={m.merchant}
                      className="p-2.5 rounded-lg border border-border/70 bg-card/60 space-y-1.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-xs truncate max-w-[240px]">
                          {m.merchant}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            ₹{Math.round(m.spent).toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCreateRule(m.merchant)}
                            title="Create Auto-Categorization Rule"
                            className="p-1 text-primary hover:bg-primary/10 rounded transition-colors text-[10px] flex items-center gap-1"
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span>Rule</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${Math.min(m.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-medium">{m.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Category Transactions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Category Activity
              </h4>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {categoryTxns.slice(0, 10).map((t) => {
                    const merchantName =
                      t.normalizedDescription ||
                      (t.maskedDescription && !t.maskedDescription.includes('XXXX')
                        ? t.maskedDescription
                        : null) ||
                      t.description;

                    return (
                      <div key={t.id} className="p-2.5 flex items-center justify-between hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {new Date(t.txnDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </div>
                          <p className="font-medium text-foreground text-xs truncate max-w-[220px]">
                            {merchantName}
                          </p>
                        </div>
                        <span className="font-bold text-foreground text-xs whitespace-nowrap">
                          ₹{Math.abs(Number(t.amountSigned) || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-end shrink-0">
            <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
