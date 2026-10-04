import React from 'react';

export interface CategoryBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  name,
  color,
  className = '',
  size = 'sm',
}) => {
  const dotColor = color || '#64748B';
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1.5'
      : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border border-border/60 bg-muted/50 text-foreground transition-colors ${sizeClasses} ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 shadow-xs"
        style={{ backgroundColor: dotColor }}
      />
      <span className="truncate max-w-[120px]">{name}</span>
    </span>
  );
};
