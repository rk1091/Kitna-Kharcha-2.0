import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UploadCloud, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onToggleCopilot?: () => void;
  copilotOpen?: boolean;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Financial overview and cashflow analytics' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Financial overview and cashflow analytics' },
  '/transactions': { title: 'Transactions Ledger', subtitle: 'Full transaction history with categorization' },
  '/statements': { title: 'Statements Management', subtitle: 'Uploaded bank statements and parsing health' },
  '/rules': { title: 'Classification Rules', subtitle: 'Deterministic compound rules engine' },
  '/upload': { title: 'Upload Hub', subtitle: 'Ingest PDF, CSV, Excel or pasted text statements' },
  '/recurring': { title: 'Recurring Subscriptions & EMIs', subtitle: 'Auto-detected bills and periodic commitments' },
  '/budgets': { title: 'Budget Management', subtitle: 'Category spending targets and AI recommendations' },
  '/insights': { title: 'AI Insights & Anomalies', subtitle: 'Proactive spending alerts and anomalies' },
  '/settings': { title: 'User Settings', subtitle: 'Privacy preferences, currency, and configuration' },
};

export const Header: React.FC<HeaderProps> = ({ onToggleCopilot, copilotOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentMeta = pageTitles[location.pathname] || {
    title: 'Kitna Kharcha',
    subtitle: 'Privacy-First AI Finance Intelligence',
  };

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{currentMeta.title}</h2>
        <p className="text-[11px] text-muted-foreground">{currentMeta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs font-medium"
          onClick={() => navigate('/upload')}
        >
          <UploadCloud className="h-3.5 w-3.5 text-primary" />
          <span>Quick Upload</span>
        </Button>

        {onToggleCopilot && (
          <Button
            variant={copilotOpen ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-2 text-xs font-medium"
            onClick={onToggleCopilot}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Copilot</span>
          </Button>
        )}

        <ModeToggle />
      </div>
    </header>
  );
};
