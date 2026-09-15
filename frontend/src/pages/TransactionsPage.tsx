import React, { useEffect, useState } from 'react';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, X, RefreshCw, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  txnDate: string;
  description: string;
  maskedDescription: string;
  normalizedDescription?: string;
  amountSigned: string;
  currency: string;
  direction: 'CREDIT' | 'DEBIT';
  category: Category | null;
  categoryId: string | null;
  classificationReason: string;
  tags: string[];
}

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  // Edit Drawer State
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    apiClient
      .get('/transactions')
      .then((res) => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load transactions');
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    apiClient
      .get('/transactions/categories/all')
      .then((res) => setCategories(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const openEditor = (txn: Transaction) => {
    setEditingTxn(txn);
    setEditCategoryId(txn.categoryId || '');
    setEditTags(txn.tags || []);
    setNewTagInput('');
  };

  const handleSaveEdit = async () => {
    if (!editingTxn) return;
    setUpdating(true);

    try {
      await apiClient.put(`/transactions/${editingTxn.id}`, {
        categoryId: editCategoryId || null,
        tags: editTags,
      });

      toast.success('Transaction updated & auto-learning rule created');
      setEditingTxn(null);
      fetchTransactions();
    } catch {
      toast.error('Failed to update transaction');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterDirection !== 'ALL' && t.direction !== filterDirection) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.normalizedDescription && t.normalizedDescription.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q) ||
      (t.category && t.category.name.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Transactions Ledger</CardTitle>
              <CardDescription className="text-xs">
                {filteredTransactions.length} of {transactions.length} transactions displayed
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTransactions} className="h-8 gap-2 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search merchant, description, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
              <Button
                variant={filterDirection === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDirection('ALL')}
                className="h-9 text-xs flex-1 sm:flex-initial"
              >
                All
              </Button>
              <Button
                variant={filterDirection === 'DEBIT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDirection('DEBIT')}
                className="h-9 text-xs flex-1 sm:flex-initial"
              >
                Expenses
              </Button>
              <Button
                variant={filterDirection === 'CREDIT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDirection('CREDIT')}
                className="h-9 text-xs flex-1 sm:flex-initial"
              >
                Income
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[11px]">Date</TableHead>
                <TableHead className="text-[11px]">Clean Merchant</TableHead>
                <TableHead className="text-[11px] hidden md:table-cell">Masked Description</TableHead>
                <TableHead className="text-[11px]">Category</TableHead>
                <TableHead className="text-[11px] hidden lg:table-cell">Classification</TableHead>
                <TableHead className="text-[11px] text-right">Amount</TableHead>
                <TableHead className="text-[11px] w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    Loading transactions ledger...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No transactions match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => {
                  const isCredit = t.direction === 'CREDIT';
                  return (
                    <TableRow
                      key={t.id}
                      onClick={() => openEditor(t)}
                      className="cursor-pointer text-xs hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {new Date(t.txnDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground max-w-[180px] truncate">
                        {t.normalizedDescription || 'Unknown Merchant'}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell max-w-[220px] truncate text-[11px]">
                        {t.maskedDescription}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.category ? 'secondary' : 'outline'}
                          className="text-[10px] font-medium"
                        >
                          {t.category ? t.category.name : 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-muted text-muted-foreground">
                          {t.classificationReason}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold whitespace-nowrap ${
                          isCredit ? 'text-emerald-500' : 'text-foreground'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹
                        {Math.abs(Number(t.amountSigned)).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Drawer / Modal */}
      {editingTxn && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Edit Transaction</h3>
                <button
                  onClick={() => setEditingTxn(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Merchant</p>
                <p className="text-sm font-semibold text-foreground">
                  {editingTxn.normalizedDescription || 'Unknown Merchant'}
                </p>
                <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg font-mono break-all">
                  {editingTxn.maskedDescription}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Changing the category will auto-generate a classification rule for future uploads.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs gap-1 py-0.5">
                      <span>{tag}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-rose-500"
                        onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (e.g. late-night, food)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        if (!editTags.includes(newTagInput.trim())) {
                          setEditTags([...editTags, newTagInput.trim()]);
                        }
                        setNewTagInput('');
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      if (newTagInput.trim() && !editTags.includes(newTagInput.trim())) {
                        setEditTags([...editTags, newTagInput.trim()]);
                        setNewTagInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingTxn(null)} disabled={updating}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={updating}>
                {updating ? 'Saving...' : 'Save & Learn'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
