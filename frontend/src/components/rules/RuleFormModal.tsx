import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Sliders, Check, Tag as TagIcon, Layers, ShieldCheck } from 'lucide-react';
import { CategoryOption } from '@/components/transactions/TransactionEditDrawer';

export interface RuleFormData {
  id?: string;
  name: string;
  field: 'normalizedDescription' | 'description';
  operator: 'contains' | 'equals' | 'starts_with' | 'regex';
  value: string;
  direction?: 'DEBIT' | 'CREDIT' | 'ALL';
  amountLessThan?: number;
  amountGreaterThan?: number;
  categoryId: string;
  tags: string[];
  priority: number;
  isActive: boolean;
}

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RuleFormData) => Promise<void>;
  initialData?: RuleFormData | null;
  categories: CategoryOption[];
}

export const RuleFormModal: React.FC<RuleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}) => {
  const [name, setName] = useState('');
  const [field, setField] = useState<'normalizedDescription' | 'description'>('normalizedDescription');
  const [operator, setOperator] = useState<'contains' | 'equals' | 'starts_with' | 'regex'>('contains');
  const [value, setValue] = useState('');
  const [direction, setDirection] = useState<'DEBIT' | 'CREDIT' | 'ALL'>('ALL');
  const [amountLessThan, setAmountLessThan] = useState<string>('');
  const [amountGreaterThan, setAmountGreaterThan] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<number>(50);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setField(initialData.field || 'normalizedDescription');
      setOperator(initialData.operator || 'contains');
      setValue(initialData.value || '');
      setDirection(initialData.direction || 'ALL');
      setAmountLessThan(initialData.amountLessThan !== undefined ? String(initialData.amountLessThan) : '');
      setAmountGreaterThan(initialData.amountGreaterThan !== undefined ? String(initialData.amountGreaterThan) : '');
      setCategoryId(initialData.categoryId || '');
      setTags(initialData.tags || []);
      setPriority(initialData.priority ?? 50);
      setIsActive(initialData.isActive ?? true);
    } else {
      setName('');
      setField('normalizedDescription');
      setOperator('contains');
      setValue('');
      setDirection('ALL');
      setAmountLessThan('');
      setAmountGreaterThan('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setTags([]);
      setPriority(50);
      setIsActive(true);
    }
  }, [initialData, categories]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim() || !categoryId) return;

    setIsSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        field,
        operator,
        value: value.trim(),
        direction,
        amountLessThan: amountLessThan ? Number(amountLessThan) : undefined,
        amountGreaterThan: amountGreaterThan ? Number(amountGreaterThan) : undefined,
        categoryId,
        tags,
        priority: Number(priority) || 50,
        isActive,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl border-border bg-card">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              {initialData ? 'Edit Classification Rule' : 'Create New Classification Rule'}
            </CardTitle>
            <CardDescription className="text-xs">
              Deterministic rule evaluated before tiered AI classification
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            {/* Rule Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Rule Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swiggy Food Orders, Netflix Subscription"
                className="h-9 text-xs"
              />
            </div>

            {/* Condition Field & Operator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Match Field</label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs"
                >
                  <option value="normalizedDescription">Normalized Merchant</option>
                  <option value="description">Raw Description</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs"
                >
                  <option value="contains">Contains (case-insensitive)</option>
                  <option value="equals">Exact Equals</option>
                  <option value="starts_with">Starts With</option>
                  <option value="regex">Regular Expression</option>
                </select>
              </div>
            </div>

            {/* Match Pattern / Value */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Pattern / Value</label>
              <Input
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. swiggy, uber, netflix"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" />
                  Target Category
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.type ? `(${c.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Priority (1 - 100)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Direction Constraint */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Direction Filter (Optional)</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    checked={direction === 'ALL'}
                    onChange={() => setDirection('ALL')}
                  />
                  <span>Any</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                  <input
                    type="radio"
                    name="direction"
                    checked={direction === 'DEBIT'}
                    onChange={() => setDirection('DEBIT')}
                  />
                  <span>Debit / Expense Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                  <input
                    type="radio"
                    name="direction"
                    checked={direction === 'CREDIT'}
                    onChange={() => setDirection('CREDIT')}
                  />
                  <span>Credit / Income Only</span>
                </label>
              </div>
            </div>

            {/* Tags Management */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <TagIcon className="h-3 w-3 text-primary" />
                Assign Tags (Optional)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. food-delivery, late-night"
                  className="h-9 text-xs"
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

              <div className="flex flex-wrap gap-1.5 pt-1 min-h-[28px]">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pl-2 pr-1 py-0.5 text-[10px] bg-primary/10 text-primary border-primary/20"
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
                ))}
              </div>
            </div>

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <p className="font-semibold text-foreground">Rule Status</p>
                <p className="text-[10px] text-muted-foreground">
                  Active rules are evaluated immediately during statement parsing
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </CardContent>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-card/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Evaluated in memory locally</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
                className="h-8 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !name.trim() || !value.trim() || !categoryId}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                {isSaving ? 'Saving...' : initialData ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
