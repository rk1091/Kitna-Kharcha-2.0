import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap } from 'lucide-react';

export const RecurringPage: React.FC = () => {
  // Demo recurring subscriptions detected by engine
  const sampleSubscriptions = [
    { name: 'Netflix Premium', category: 'Entertainment', amount: 649, frequency: 'Monthly', nextDate: '18-Oct-26', status: 'ACTIVE' },
    { name: 'Spotify Individual', category: 'Entertainment', amount: 119, frequency: 'Monthly', nextDate: '24-Oct-26', status: 'ACTIVE' },
    { name: 'Airtel Broadband Fiber', category: 'Utilities & Bills', amount: 999, frequency: 'Monthly', nextDate: '01-Nov-26', status: 'ACTIVE' },
    { name: 'HDFC Home Loan EMI', category: 'Loans & EMI', amount: 28500, frequency: 'Monthly', nextDate: '05-Nov-26', status: 'ACTIVE' },
  ];

  const totalMonthlyRecurring = sampleSubscriptions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recurring Commitments & Subscriptions</CardTitle>
            <CardDescription className="text-xs">
              Automated cadence detection for EMIs, SIPs, and digital subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              ₹{totalMonthlyRecurring.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-muted-foreground ml-2">/ month</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Estimated recurring outflow across {sampleSubscriptions.length} detected active services
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Detection Engine</CardTitle>
            <CardDescription className="text-xs">Pattern matching on transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Zap className="h-4 w-4" />
              <span>Recurring Scanner Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleSubscriptions.map((sub, idx) => (
          <Card key={idx} className="shadow-sm hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">{sub.name}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{sub.category}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {sub.frequency}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                ₹{sub.amount.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>Next estimated debit: {sub.nextDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
