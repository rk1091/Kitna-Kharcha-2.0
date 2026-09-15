import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const sampleBudgets = [
    { category: 'Food & Dining', spent: 12450, budget: 15000, color: 'bg-primary' },
    { category: 'Shopping', spent: 18200, budget: 15000, color: 'bg-rose-500' },
    { category: 'Transport', spent: 3400, budget: 6000, color: 'bg-blue-500' },
    { category: 'Entertainment', spent: 2200, budget: 4000, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* AI Recommender Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Budget Recommendations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Copilot can analyze your 3-month spending history and generate realistic category targets.
          </p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-medium shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
          Auto-Suggest Budgets
        </Button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleBudgets.map((b, idx) => {
          const percentage = Math.min(100, Math.round((b.spent / b.budget) * 100));
          const isOver = b.spent > b.budget;
          return (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{b.category}</CardTitle>
                  <CardDescription className="text-xs">
                    ₹{b.spent.toLocaleString('en-IN')} of ₹{b.budget.toLocaleString('en-IN')}
                  </CardDescription>
                </div>
                {isOver ? (
                  <Badge variant="destructive" className="gap-1 text-[10px]">
                    <AlertTriangle className="h-3 w-3" />
                    Over Budget ({percentage}%)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    {percentage}% Used
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>₹{(b.budget - b.spent > 0 ? b.budget - b.spent : 0).toLocaleString('en-IN')} remaining</span>
                  <span>Target: ₹{b.budget.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
