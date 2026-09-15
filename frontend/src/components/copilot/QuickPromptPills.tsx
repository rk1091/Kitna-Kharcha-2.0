import React from 'react';
import {
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Zap,
  Store,
  Flame,
} from 'lucide-react';

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  icon: React.ReactNode;
}

interface QuickPromptPillsProps {
  onSelectPrompt: (query: string) => void;
  disabled?: boolean;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'trends',
    label: 'Analyze Trends',
    query: 'What is my spending trend over the last 3 months?',
    icon: <TrendingUp className="h-3 w-3 text-blue-500" />,
  },
  {
    id: 'budget',
    label: 'Suggest Budget',
    query: 'Suggest a realistic monthly budget based on my spending history',
    icon: <PiggyBank className="h-3 w-3 text-emerald-500" />,
  },
  {
    id: 'anomalies',
    label: 'Detect Anomalies',
    query: 'Did I have any unusual spending spikes or anomalous transactions?',
    icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
  },
  {
    id: 'recurring',
    label: 'Subscriptions',
    query: 'What are my active recurring subscriptions and monthly commitment?',
    icon: <Zap className="h-3 w-3 text-purple-500" />,
  },
  {
    id: 'merchants',
    label: 'Top Merchants',
    query: 'Who are my top 5 merchants by spend and what percentage do they represent?',
    icon: <Store className="h-3 w-3 text-rose-500" />,
  },
  {
    id: 'weekend',
    label: 'Weekend Spend',
    query: 'How does my weekend discretionary spending compare to weekdays?',
    icon: <Flame className="h-3 w-3 text-orange-500" />,
  },
];

export const QuickPromptPills: React.FC<QuickPromptPillsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
      {QUICK_PROMPTS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.query)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full bg-card border border-border/80 hover:border-primary/40 hover:bg-accent/60 text-foreground transition-all shrink-0 shadow-2xs disabled:opacity-50 disabled:pointer-events-none active:scale-95"
        >
          {item.icon}
          <span className="font-medium text-[11px]">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
