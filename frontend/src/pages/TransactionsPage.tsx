import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Search,
  RefreshCw,
  Receipt,
  FileText,
  X,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Tag as TagIcon,
} from 'lucide-react';
import {
  TransactionEditDrawer,
  CategoryOption,
  EditableTransaction,
} from '@/components/transactions/TransactionEditDrawer';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TagBadge } from '@/components/ui/TagBadge';

interface StatementOption {
  id: string;
  fileName: string;
  bankName?: string | null;
}

export const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statementIdParam = searchParams.get('statementId') || '';

  const [transactions, setTransactions] = useState<EditableTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [statements, setStatements] = useState<StatementOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [selectedStatementId, setSelectedStatementId] = useState(statementIdParam);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer State
  const [editingTransaction, setEditingTransaction] = useState<EditableTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Synchronize URL param with filter state
  useEffect(() => {
    setSelectedStatementId(statementIdParam);
  }, [statementIdParam]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedStatementId) params.statementId = selectedStatementId;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (filterDirection !== 'ALL') params.direction = filterDirection;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get<EditableTransaction[]>('/transactions', { params });
      setTransactions(res.data || []);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      toast.error('Failed to load transactions ledger');
    } finally {
      setLoading(false);
    }
  }, [selectedStatementId, selectedCategory, selectedTag, filterDirection, searchQuery]);

  const fetchCategoriesAndStatements = useCallback(async () => {
    try {
      const [catsRes, stmtsRes, tagsRes] = await Promise.all([
        apiClient.get<CategoryOption[]>('/transactions/categories/all'),
        apiClient.get<StatementOption[]>('/statements'),
        apiClient.get<string[]>('/transactions/tags/all'),
      ]);
      setCategories(catsRes.data || []);
      setStatements(stmtsRes.data || []);
      setAvailableTags(tagsRes.data || []);
    } catch (err) {
      console.error('Failed to load categories/statements/tags metadata:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndStatements();
  }, [fetchCategoriesAndStatements]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Edit Transaction Save
  const handleSaveTransaction = async (updatedData: {
    id: string;
    normalizedDescription: string;
    categoryId: string;
    tags: string[];
  }) => {
    try {
      const res = await apiClient.patch(`/transactions/${updatedData.id}`, {
        normalizedDescription: updatedData.normalizedDescription,
        categoryId: updatedData.categoryId || null,
        tags: updatedData.tags,
      });

      toast.success('Transaction updated and classification model trained');

      // Update in local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedData.id ? { ...t, ...res.data } : t)),
      );
    } catch (err) {
      console.error('Failed to update transaction:', err);
      toast.error('Failed to save transaction changes');
      throw err;
    }
  };

  // Single Delete
  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      toast.error('Failed to delete transaction');
    }
  };

  // Bulk Categorize
  const handleBulkCategorize = async (categoryId: string) => {
    if (selectedIds.length === 0) return;
    try {
      await apiClient.post('/transactions/bulk-categorize', {
        transactionIds: selectedIds,
        categoryId,
      });
      toast.success(`Categorized ${selectedIds.length} transactions`);
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to bulk categorize:', err);
      toast.error('Failed to apply bulk categorization');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected transactions?`)) return;

    try {
      await apiClient.post('/transactions/bulk-delete', {
        transactionIds: selectedIds,
      });
      toast.success(`Deleted ${selectedIds.length} transactions`);
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to bulk delete:', err);
      toast.error('Failed to delete transactions');
    }
  };

  // Selection Toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const pageTxns = transactions.slice(startIndex, startIndex + pageSize);
    const pageIds = pageTxns.map((t) => t.id);

    const isAllPageSelected = pageIds.every((id) => selectedIds.includes(id));

    if (isAllPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const clearStatementFilter = () => {
    setSelectedStatementId('');
    searchParams.delete('statementId');
    setSearchParams(searchParams);
  };

  // Summary figures for filtered transactions
  const { totalDebits, totalCredits } = useMemo(() => {
    let debits = 0;
    let credits = 0;
    transactions.forEach((t) => {
      const amt = Math.abs(Number(t.amountSigned) || 0);
      if (t.direction === 'CREDIT') credits += amt;
      else debits += amt;
    });
    return { totalDebits: debits, totalCredits: credits };
  }, [transactions]);

  const activeStatement = statements.find((s) => s.id === selectedStatementId);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Transactions Ledger
            <Receipt className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full transaction history with inline classification, manual editing, and batch categorization.
          </p>
        </div>

        {/* Ledger Summary Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-card border border-border px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span className="font-semibold">
                ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="font-semibold">
                ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions()}
            className="h-8 gap-2 text-xs font-medium"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">Filter Ledger</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {transactions.length} transactions matched
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {/* Active Statement Filter Pill */}
          {activeStatement && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground animate-in fade-in">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>
                Filtered by statement:{' '}
                <strong>
                  {activeStatement.bankName ? `[${activeStatement.bankName}] ` : ''}
                  {activeStatement.fileName.replace(/^.*[\\/]/, '')}
                </strong>
              </span>
              <button
                type="button"
                onClick={clearStatementFilter}
                className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Active Tag Filter Pill */}
          {selectedTag && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground animate-in fade-in">
              <TagIcon className="h-3.5 w-3.5 text-primary" />
              <span className="flex items-center gap-1.5">
                Filtered by tag: <TagBadge tag={selectedTag} />
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground"
                title="Clear tag filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search merchant or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs shadow-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs shadow-xs"
            >
              <option value="">All Tags ({availableTags.length})</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            {/* Statement Filter */}
            <select
              value={selectedStatementId}
              onChange={(e) => {
                setSelectedStatementId(e.target.value);
                if (e.target.value) {
                  searchParams.set('statementId', e.target.value);
                } else {
                  searchParams.delete('statementId');
                }
                setSearchParams(searchParams);
              }}
              className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-xs shadow-xs"
            >
              <option value="">All Statements</option>
              {statements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.bankName ? `[${s.bankName}] ` : ''}
                  {s.fileName.replace(/^.*[\\/]/, '')}
                </option>
              ))}
            </select>

            {/* Direction Filter Toggle */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setFilterDirection('ALL')}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterDirection === 'ALL'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterDirection('DEBIT')}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterDirection === 'DEBIT'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Debits
              </button>
              <button
                type="button"
                onClick={() => setFilterDirection('CREDIT')}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterDirection === 'CREDIT'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Credits
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        categories={categories}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onEdit={(txn) => {
          setEditingTransaction(txn);
          setIsDrawerOpen(true);
        }}
        onDelete={handleDeleteTransaction}
        onBulkCategorize={handleBulkCategorize}
        onBulkDelete={handleBulkDelete}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        loading={loading}
      />

      {/* Edit Transaction Slide-out Drawer */}
      <TransactionEditDrawer
        transaction={editingTransaction}
        categories={categories}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};
