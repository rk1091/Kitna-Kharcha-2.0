import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const sampleInsights = [
    {
      type: 'ANOMALY',
      title: 'Unusually High Transaction Detected',
      description: '₹4,890 at Apple Services is 3.5x higher than your 30-day average for digital purchases.',
      icon: AlertCircle,
      color: 'text-amber-500 bg-amber-500/10',
      badge: 'Anomaly',
    },
    {
      type: 'TREND',
      title: 'Dining Expenses Decreased by 14%',
      description: 'You spent ₹2,100 less on Swiggy & Zomato compared to last week.',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10',
      badge: 'Positive Trend',
    },
    {
      type: 'TIP',
      title: 'Duplicate Transaction Check Passed',
      description: 'Zero duplicate debit entries detected across your latest HDFC and SBI statements.',
      icon: CheckCircle,
      color: 'text-primary bg-primary/10',
      badge: 'Data Integrity',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Financial Intelligence & Insights Feed
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time proactive observations generated across your parsed statements
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sampleInsights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <Card key={idx} className="shadow-sm">
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className={`p-2 rounded-xl shrink-0 ${insight.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground">{insight.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {insight.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
