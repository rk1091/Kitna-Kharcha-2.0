import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 bg-muted/20 animate-in fade-in duration-300 ${className}`}
    >
      <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-3 text-muted-foreground shadow-2xs">
        {icon || <Sparkles className="h-6 w-6 text-primary" />}
      </div>

      <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          size="sm"
          onClick={onAction}
          className="h-8 text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
