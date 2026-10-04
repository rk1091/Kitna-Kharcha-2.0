import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tv,
  Zap,
  Landmark,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface RecurringGroupItem {
  id: string;
  merchantId: string | null;
  categoryId: string | null;
  type: 'SUBSCRIPTION' | 'EMI' | 'SALARY' | 'UTILITY' | 'REGULAR_EXPENSE';
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  avgAmount: number;
  currency: string;
  lastSeenDate: string;
  isActive: boolean;
}

interface RecurringCardProps {
  item: RecurringGroupItem;
  onToggle: (id: string) => void;
  isToggling?: boolean;
}

export const RecurringCard: React.FC<RecurringCardProps> = ({
  item,
  onToggle,
  isToggling,
}) => {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200';
      case 'UTILITY':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200';
      case 'EMI':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION':
        return <Tv className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'UTILITY':
        return <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'EMI':
        return <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formattedDate = new Date(item.lastSeenDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className={`shadow-sm transition-all border ${item.isActive ? 'border-border' : 'opacity-60 border-dashed bg-muted/30'}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-background border border-border/80 shadow-xs">
              {getTypeIcon(item.type)}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                {item.merchantId || 'Recurring Expense'}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${getTypeBadgeColor(item.type)}`}>
                  {item.type}
                </Badge>
                <span className="text-[11px] text-muted-foreground capitalize">
                  • {item.frequency.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount & Date */}
        <div className="pt-2 border-t border-border/50 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground">Estimated Amount</span>
            <div className="text-xl font-bold text-foreground">
              ₹{Number(item.avgAmount).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" /> Last observed
            </span>
            <span className="text-xs font-medium text-foreground">{formattedDate}</span>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="pt-2">
          <Button
            variant={item.isActive ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => onToggle(item.id)}
            disabled={isToggling}
            className="w-full text-xs gap-1.5 justify-center"
          >
            {item.isActive ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Active Recurring
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Inactive (Paused)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
