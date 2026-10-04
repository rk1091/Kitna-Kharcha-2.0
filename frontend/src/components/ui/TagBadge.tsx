import React from 'react';
import { X } from 'lucide-react';

export interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

const TAG_PALETTES = [
  'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/25',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25',
  'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30 hover:bg-pink-500/25',
  'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 hover:bg-teal-500/25',
  'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30 hover:bg-orange-500/25',
  'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30 hover:bg-lime-500/25',
  'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/25',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/25',
];

export function getTagPalette(tag: string): string {
  let hash = 0;
  const cleanTag = tag.toLowerCase().trim();
  for (let i = 0; i < cleanTag.length; i++) {
    hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_PALETTES.length;
  return TAG_PALETTES[index];
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  onClick,
  className = '',
  size = 'sm',
}) => {
  const palette = getTagPalette(tag);
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium font-mono rounded-full border transition-all select-none ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${palette} ${sizeClasses} ${className}`}
    >
      <span>#{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-hidden p-0.5 rounded-full"
          title={`Remove tag #${tag}`}
        >
          <X className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        </button>
      )}
    </span>
  );
};
