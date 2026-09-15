import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

export interface TopMerchantItem {
  merchant: string;
  totalSpent: number;
  count: number;
  percentageOfTotal: number;
}

interface TopMerchantsListProps {
  merchants: TopMerchantItem[];
  totalExpense: number;
}

export const TopMerchantsList: React.FC<TopMerchantsListProps> = ({ merchants, totalExpense }) => {
  const maxSpend = merchants.length > 0 ? merchants[0].totalSpent : 1;

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" />
          Top 10 Merchants by Spend
        </CardTitle>
        <CardDescription className="text-xs">Highest spend volume destinations in selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {merchants.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <p>No merchant activity recorded in this period</p>
          </div>
        ) : (
          <div className="space-y-3.5 pt-1">
            {merchants.map((item, idx) => {
              const barWidth = Math.max(4, Math.round((item.totalSpent / maxSpend) * 100));
              const percentOfExpense =
                totalExpense > 0 ? ((item.totalSpent / totalExpense) * 100).toFixed(1) : '0.0';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 text-[11px] font-bold text-muted-foreground">{idx + 1}.</span>
                      <span className="font-medium text-foreground truncate max-w-[170px] sm:max-w-[220px]">
                        {item.merchant}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({item.count} {item.count === 1 ? 'txn' : 'txns'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-medium">{percentOfExpense}%</span>
                      <span className="font-semibold text-foreground">
                        ₹{item.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Spend relative visual bar */}
                  <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/80 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
