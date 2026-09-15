import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CreditCard,
  PiggyBank,
  Flame,
  TrendingUp,
  Zap,
  ArrowRight,
  X,
} from 'lucide-react';

export interface FinancialInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  icon: string;
  metric?: string;
  value?: number;
  actionableTip?: string;
  generatedAt: string;
}

export const InsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/insights/feed');
        setInsights(res.data || []);
      } catch {
        // Silently fail if no insights or fresh database
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInsights();
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const handleAskCopilot = (insight: FinancialInsight) => {
    const prompt = `Tell me more about this insight: "${insight.title}". ${insight.description}. What should I do about it?`;
    navigate(`/copilot?q=${encodeURIComponent(prompt)}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION_AUDIT':
        return <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'SAVINGS_RATE':
        return <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'WEEKEND_SPIKE':
        return <Flame className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'MERCHANT_IMPACT':
        return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'UTILITY_ALERT':
        return <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SUCCESS':
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">Healthy</Badge>;
      case 'WARNING':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">Warning</Badge>;
      case 'ALERT':
        return <Badge variant="destructive" className="text-[10px]">Alert</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Insight</Badge>;
    }
  };

  const visibleInsights = insights.filter(i => !dismissedIds.includes(i.id));

  if (isLoading || visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Proactive Intelligence Feed
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {visibleInsights.length} actionable insight{visibleInsights.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visibleInsights.map(insight => (
          <Card
            key={insight.id}
            className="shadow-xs border-border/80 hover:border-primary/40 transition-all bg-card/60 backdrop-blur-xs flex flex-col justify-between"
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted border border-border">
                    {getIcon(insight.type)}
                  </div>
                  <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                    {insight.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  {getSeverityBadge(insight.severity)}
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {insight.description}
              </p>

              {/* Actionable Tip */}
              {insight.actionableTip && (
                <div className="p-2 rounded-md bg-muted/40 text-[10px] text-muted-foreground italic border border-border/50">
                  💡 {insight.actionableTip}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                {insight.metric && (
                  <span className="text-xs font-bold text-foreground">
                    {insight.metric}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAskCopilot(insight)}
                  className="h-6 text-[10px] gap-1 px-2 text-primary hover:text-primary ml-auto"
                >
                  <span>Ask Copilot</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
