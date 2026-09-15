import React, { useState, useEffect } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Tag as TagIcon, Check, Store, Layers } from 'lucide-react';

export interface CategoryOption {
  id: string;
  name: string;
  type?: string;
  colorHex?: string;
}

export interface EditableTransaction {
  id: string;
  txnDate: string;
  description: string;
  maskedDescription?: string;
  normalizedDescription?: string;
  amountSigned: string | number;
  currency: string;
  direction: 'CREDIT' | 'DEBIT';
  category: CategoryOption | null;
  categoryId: string | null;
  classificationReason?: string;
  tags?: string[];
}

interface TransactionEditDrawerProps {
  transaction: EditableTransaction | null;
  categories: CategoryOption[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: {
    id: string;
    normalizedDescription: string;
    categoryId: string;
    tags: string[];
  }) => Promise<void>;
}

export const TransactionEditDrawer: React.FC<TransactionEditDrawerProps> = ({
  transaction,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  const [normalizedDescription, setNormalizedDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setNormalizedDescription(
        transaction.normalizedDescription ||
          (transaction.maskedDescription && !transaction.maskedDescription.includes('XXXX')
            ? transaction.maskedDescription
            : null) ||
          transaction.description ||
          '',
      );
      setSelectedCategoryId(transaction.categoryId || transaction.category?.id || '');
      setTags(transaction.tags || []);
      setTagInput('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        id: transaction.id,
        normalizedDescription: normalizedDescription.trim(),
        categoryId: selectedCategoryId,
        tags,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const isCredit = transaction.direction === 'CREDIT';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Edit Transaction
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Update classification, merchant name, or custom tags
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>

          {/* Form Content */}
          <CardContent className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Amount & Date Summary Box */}
            <div className="p-3.5 rounded-xl bg-accent/40 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Transaction Amount</span>
                <span
                  className={`text-base font-bold ${
                    isCredit ? 'text-emerald-500' : 'text-foreground'
                  }`}
                >
                  {isCredit ? '+' : '-'}₹
                  {Math.abs(Number(transaction.amountSigned) || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span>Date:</span>
                <span className="text-foreground font-medium">
                  {new Date(transaction.txnDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground break-all">
                <span className="font-semibold text-muted-foreground">Original Raw:</span>{' '}
                {transaction.description}
              </div>
            </div>

            {/* Normalized Merchant / Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-primary" />
                Merchant / Normalized Label
              </label>
              <Input
                value={normalizedDescription}
                onChange={(e) => setNormalizedDescription(e.target.value)}
                placeholder="e.g. Swiggy, Netflix, Amazon"
                className="h-9 text-xs bg-background"
              />
              <p className="text-[10px] text-muted-foreground">
                Updating this trains the deterministic rule engine for future statements.
              </p>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.type ? `(${cat.type})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Management */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5 text-primary" />
                Custom Tags
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag (e.g. tax-deductible, impulse)"
                  className="h-9 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  className="h-9 px-3 text-xs shrink-0"
                >
                  Add
                </Button>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 min-h-[32px]">
                {tags.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">No tags attached</span>
                ) : (
                  tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive p-0.5 rounded"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Reason Pill */}
            {transaction.classificationReason && (
              <div className="pt-2">
                <span className="text-[10px] text-muted-foreground">
                  Current Classification Engine: <strong className="font-mono text-foreground">{transaction.classificationReason}</strong>
                </span>
              </div>
            )}
          </CardContent>

          {/* Footer Actions with High Contrast Buttons */}
          <div className="p-4 border-t border-border bg-card/60 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-medium border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
