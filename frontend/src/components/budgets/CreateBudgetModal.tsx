import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: { categoryId: string; amount: number; period: 'MONTHLY' }) => Promise<void>;
  categories: CategoryOption[];
  defaultValues?: { categoryId?: string; amount?: number };
}

export const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  defaultValues,
}) => {
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || '');
  const [amount, setAmount] = useState(defaultValues?.amount ? String(defaultValues.amount) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive budget amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        categoryId,
        amount: numAmount,
        period: 'MONTHLY',
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <Card className="w-full max-w-md shadow-xl border-border animate-in fade-in zoom-in-95 duration-150">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Set Category Budget</CardTitle>
            <CardDescription className="text-xs mt-1">
              Define monthly spending limits with automated alerts at 80% and 100%.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Select a Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Monthly Limit (₹)</label>
              <input
                type="number"
                step="100"
                min="100"
                placeholder="e.g. 10000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                You will receive warning alerts when expenses in this category reach 80%.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {isSubmitting ? 'Saving...' : 'Save Budget Target'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
