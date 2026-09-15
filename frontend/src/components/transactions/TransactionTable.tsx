import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import { CategoryOption, EditableTransaction } from './TransactionEditDrawer';
import { TagBadge } from '@/components/ui/TagBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

interface TransactionTableProps {
  transactions: EditableTransaction[];
  categories: CategoryOption[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (transaction: EditableTransaction) => void;
  onDelete: (id: string) => void;
  onBulkCategorize: (categoryId: string) => void;
  onBulkDelete: () => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onBulkCategorize,
  onBulkDelete,
  currentPage,
  pageSize,
  onPageChange,
  loading,
}) => {
  const [bulkCategory, setBulkCategory] = React.useState('');

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentTransactions = transactions.slice(startIndex, startIndex + pageSize);

  const isAllSelected =
    currentTransactions.length > 0 &&
    currentTransactions.every((t) => selectedIds.includes(t.id));
  const isSomeSelected =
    currentTransactions.some((t) => selectedIds.includes(t.id)) && !isAllSelected;

  const handleApplyBulkCategory = () => {
    if (bulkCategory) {
      onBulkCategorize(bulkCategory);
      setBulkCategory('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 flex flex-wrap items-center justify-between gap-3 animate-in fade-in text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{selectedIds.length} selected</span>
            <span className="text-muted-foreground">• Apply batch modifications</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="h-8 px-2 rounded-md border border-input bg-card text-foreground text-xs"
              >
                <option value="">-- Assign Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleApplyBulkCategory}
                disabled={!bulkCategory}
                className="h-8 px-2.5 text-xs font-medium"
              >
                Apply
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="h-8 px-2.5 text-xs gap-1 font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-10 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : isSomeSelected ? (
                    <MinusSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-[11px] font-semibold">Date</TableHead>
              <TableHead className="text-[11px] font-semibold">Merchant / Description</TableHead>
              <TableHead className="text-[11px] font-semibold">Category</TableHead>
              <TableHead className="text-[11px] font-semibold hidden md:table-cell">Tags</TableHead>
              <TableHead className="text-[11px] font-semibold hidden lg:table-cell">Engine</TableHead>
              <TableHead className="text-[11px] font-semibold text-right">Amount</TableHead>
              <TableHead className="text-[11px] font-semibold text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-xs text-muted-foreground">
                  Loading transactions ledger...
                </TableCell>
              </TableRow>
            ) : currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-xs text-muted-foreground">
                  No transactions match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                const isCredit = t.direction === 'CREDIT';
                const merchantName =
                  t.normalizedDescription ||
                  (t.maskedDescription && !t.maskedDescription.includes('XXXX')
                    ? t.maskedDescription
                    : null) ||
                  t.description;

                return (
                  <TableRow
                    key={t.id}
                    className={`text-xs transition-colors ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(t.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                      {new Date(t.txnDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>

                    {/* Merchant & Raw Description */}
                    <TableCell className="font-medium">
                      <div className="max-w-[220px] truncate">
                        <p className="text-foreground font-semibold truncate">{merchantName}</p>
                        {t.normalizedDescription && t.description !== t.normalizedDescription && (
                          <p className="text-[10px] text-muted-foreground truncate" title={t.description}>
                            {t.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {t.category ? (
                        <CategoryBadge
                          name={t.category.name}
                          color={t.category.color || t.category.colorHex}
                        />
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                          Uncategorized
                        </Badge>
                      )}
                    </TableCell>

                    {/* Tags */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {t.tags && t.tags.length > 0 ? (
                          t.tags.slice(0, 2).map((tag) => (
                            <TagBadge key={tag} tag={tag} size="sm" />
                          ))
                        ) : (
                          <span className="text-muted-foreground/40 text-[10px]">—</span>
                        )}
                        {t.tags && t.tags.length > 2 && (
                          <span className="text-[9px] text-muted-foreground font-bold self-center">
                            +{t.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Reason / Classification Source */}
                    <TableCell className="hidden lg:table-cell">
                      {t.classificationReason === 'MANUAL_OVERRIDE' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                          <Pencil className="h-2.5 w-2.5" /> Manual
                        </span>
                      ) : t.classificationReason?.includes('RULE') ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                          <Layers className="h-2.5 w-2.5" /> Rule
                        </span>
                      ) : t.classificationReason?.includes('LLM') ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-500">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Default</span>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell
                      className={`text-right font-semibold whitespace-nowrap ${
                        isCredit ? 'text-emerald-500' : 'text-foreground'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹
                      {Math.abs(Number(t.amountSigned) || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(t)}
                          title="Edit transaction"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          title="Delete transaction"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {transactions.length > 0 && (
          <div className="p-3 border-t border-border bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(startIndex + pageSize, transactions.length)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{transactions.length}</span>{' '}
              transactions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
