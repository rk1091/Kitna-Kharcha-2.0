import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingDown, RefreshCw } from 'lucide-react';

interface SubscriptionAuditBannerProps {
  totalMonthlyCommitment: number;
  activeCount: number;
  totalCount: number;
  onRunScan: () => void;
  isScanning: boolean;
}

export const SubscriptionAuditBanner: React.FC<SubscriptionAuditBannerProps> = ({
  totalMonthlyCommitment,
  activeCount,
  totalCount,
  onRunScan,
  isScanning,
}) => {
  const annualized = totalMonthlyCommitment * 12;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Commitment Overview Card */}
      <Card className="shadow-sm md:col-span-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Recurring Commitment Audit
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                ₹{totalMonthlyCommitment.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-muted-foreground ml-2">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Annualized commitment: <strong className="text-foreground">₹{annualized.toLocaleString('en-IN')}/year</strong> across {activeCount} active recurring services ({totalCount} total detected).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRunScan}
              disabled={isScanning}
              className="gap-1.5 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Re-scan Statements'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights Stat Card */}
      <Card className="shadow-sm border-border flex flex-col justify-center">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Cadence Distribution</span>
          </div>
          <div className="text-sm font-medium text-foreground">
            {activeCount > 0 ? (
              <span>All active commitments synced to automated bank reminders</span>
            ) : (
              <span>No recurring commitments currently tracked</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Audit subscriptions to save up to 15% monthly</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
