import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

export interface BudgetProgressBarProps {
  id: string;
  categoryName: string;
  limit: number;
  currentSpend: number;
  remaining: number;
  percentageConsumed: number;
  isOverBudget: boolean;
  isWarning: boolean;
  isActive: boolean;
  onDelete: (id: string) => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  id,
  categoryName,
  limit,
  currentSpend,
  remaining,
  percentageConsumed,
  isOverBudget,
  isWarning,
  onDelete,
}) => {
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-rose-500';
    if (isWarning || percentageConsumed >= 80) return 'bg-amber-500';
    if (percentageConsumed >= 65) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const clampedWidth = Math.min(100, Math.max(0, percentageConsumed));

  return (
    <Card className="shadow-sm border-border hover:border-primary/30 transition-all">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground">{categoryName}</h4>
            <span className="text-[11px] text-muted-foreground">Monthly Category Target</span>
          </div>
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
                <AlertTriangle className="h-3 w-3" /> Exceeded
              </Badge>
            ) : isWarning ? (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1 px-2 py-0.5">
                <AlertTriangle className="h-3 w-3" /> Warning
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> On Track
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              className="h-7 w-7 text-muted-foreground hover:text-rose-600"
              title="Delete budget"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              ₹{currentSpend.toLocaleString('en-IN')}
              <span className="font-normal text-muted-foreground ml-1">of ₹{limit.toLocaleString('en-IN')}</span>
            </span>
            <span className={`font-bold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
              {percentageConsumed}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
              style={{ width: `${clampedWidth}%` }}
            />
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {isOverBudget ? (
              <strong className="text-rose-600 dark:text-rose-400">
                Over budget by ₹{(currentSpend - limit).toLocaleString('en-IN')}
              </strong>
            ) : (
              <>
                Remaining: <strong className="text-foreground">₹{remaining.toLocaleString('en-IN')}</strong>
              </>
            )}
          </span>
          <span className="text-[10px]">Resets end of month</span>
        </div>
      </CardContent>
    </Card>
  );
};
