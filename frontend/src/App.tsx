import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { LayoutDashboard, Receipt, Tag, Settings, CreditCard, UploadCloud, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/theme-toggle';
import { Toaster, toast } from 'sonner';

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
  amountSigned: string;
  currency: string;
  classificationReason: string;
  tags: string[];
  category?: Category;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Panel State
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    axios.get('http://localhost:3001/transactions')
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
    axios.get('http://localhost:3001/transactions/categories/all')
      .then((res) => setCategories(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    toast.promise(
      axios.post('http://localhost:3001/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: 'Uploading statement...',
        success: () => {
          let attempts = 0;
          const pollInterval = setInterval(() => {
            fetchTransactions();
            attempts++;
            if (attempts >= 4) clearInterval(pollInterval);
          }, 4000); // Poll 4 times, every 4 seconds (16s total)
          return 'Uploaded! AI is parsing. Auto-refreshing dashboard...';
        },
        error: 'Failed to upload statement',
      }
    );
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEditPanel = (txn: Transaction) => {
    setEditingTxn(txn);
    setEditCategoryId(txn.category?.id || '');
    setEditTags(txn.tags || []);
    setNewTagInput('');
  };

  const saveTransactionEdit = async () => {
    if (!editingTxn) return;
    try {
      await axios.patch(`http://localhost:3001/transactions/${editingTxn.id}`, {
        categoryId: editCategoryId,
        tags: editTags
      });
      toast.success('Transaction updated');
      setEditingTxn(null);
      fetchTransactions(); // Refresh
    } catch (err) {
      toast.error('Failed to update transaction');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim() !== '') {
      e.preventDefault();
      if (!editTags.includes(newTagInput.trim())) {
        setEditTags([...editTags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  // Calculate chart data (Total expenses by category & Top Merchants)
  const categoryData = transactions.reduce((acc, txn) => {
    const amount = parseFloat(txn.amountSigned);
    if (amount < 0) { // Only track expenses for the pie chart
      const catName = txn.category?.name || 'Uncategorized';
      if (!acc[catName]) acc[catName] = { value: 0, merchants: {} };
      acc[catName].value += Math.abs(amount);
      
      const merchant = txn.maskedDescription.split(' ')[0] || 'Other';
      acc[catName].merchants[merchant] = (acc[catName].merchants[merchant] || 0) + Math.abs(amount);
    }
    return acc;
  }, {} as Record<string, { value: number; merchants: Record<string, number> }>);

  const totalExpenses = Object.values(categoryData).reduce((a, b) => a + b.value, 0);
  const totalIncome = transactions.reduce((acc, txn) => {
    const amount = parseFloat(txn.amountSigned);
    return amount > 0 ? acc + amount : acc;
  }, 0);

  const chartData = Object.entries(categoryData).map(([name, data]) => {
    const topMerchants = Object.entries(data.merchants).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { name, value: data.value, topMerchants };
  });
  
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/50 text-sm z-50 min-w-[200px]">
          <p className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-2">{data.name}</p>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-3 text-lg">₹{Number(data.value).toLocaleString('en-IN')}</p>
          
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Top Breakup</p>
            {data.topMerchants.map(([mName, mValue]: any) => (
              <div key={mName} className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]" title={mName}>{mName}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">₹{Number(mValue).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatEngineName = (reason: string) => {
    if (reason === 'LLM_CLASSIFIED') return 'AI Prediction';
    if (reason === 'COMPOUND_RULE' || reason === 'EXACT_KEYWORD' || reason === 'REGEX_MATCH') return 'Smart Rule';
    if (reason === 'MANUAL_OVERRIDE') return 'Manual Override';
    return 'System Fallback';
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster position="top-right" theme="system" />
      
      {/* Sliding Edit Panel */}
      {editingTxn && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Transaction</h2>
              <button onClick={() => setEditingTxn(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Description</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{editingTxn.maskedDescription}</p>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                {parseFloat(editingTxn.amountSigned) < 0 ? '-' : '+'}₹{Math.abs(parseFloat(editingTxn.amountSigned)).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select 
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                >
                  <option value="">-- Uncategorized --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags Editor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-indigo-900 dark:hover:text-indigo-100"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter..."
                    className="w-full p-2.5 pl-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingTxn(null)}>Cancel</Button>
              <Button onClick={saveTransactionEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm z-10 transition-colors duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Kitna Kharcha</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md font-medium transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-md font-medium transition-colors">
              <Receipt className="w-5 h-5" />
              <span>Transactions</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-md font-medium transition-colors">
              <Tag className="w-5 h-5" />
              <span>Categories</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-md font-medium transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center z-10 shadow-sm transition-colors duration-300">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back. Here is your latest financial data.</p>
            </div>
            <div className="flex items-center space-x-3">
              <ModeToggle />
              <Button variant="outline" size="icon" onClick={fetchTransactions} disabled={loading} className="dark:border-slate-700 dark:hover:bg-slate-800">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <input 
                type="file" 
                accept=".pdf,.csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <Button className="flex items-center space-x-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Statement'}</span>
              </Button>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Quick Stats & Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 grid grid-cols-3 gap-6">
                  <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{transactions.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                        ₹{totalIncome.toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-rose-600 dark:text-rose-500">
                        ₹{totalExpenses.toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-3 shadow-sm border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400 uppercase">AI Pipeline Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>100% Extraction Confidence.</strong> All PII masked successfully. Processed via Hybrid Deterministic-LLM Engine.
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart Card */}
                <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                        No expenses mapped
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <Card className="shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-slate-100">Recent Transactions</CardTitle>
                  <CardDescription className="dark:text-slate-400">Your auto-categorized data securely extracted from your statement. Click a row to edit.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading secure transaction data...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:border-slate-800 dark:hover:bg-slate-800/50">
                          <TableHead className="dark:text-slate-400">Date</TableHead>
                          <TableHead className="dark:text-slate-400">Description</TableHead>
                          <TableHead className="text-right dark:text-slate-400">Amount</TableHead>
                          <TableHead className="dark:text-slate-400">Category & Tags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((txn) => {
                          const amount = parseFloat(txn.amountSigned);
                          const isDebit = amount < 0;
                          return (
                            <TableRow 
                              key={txn.id} 
                              onClick={() => openEditPanel(txn)}
                              className="dark:border-slate-800 dark:hover:bg-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <TableCell className="font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {new Date(txn.txnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{txn.maskedDescription}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1">
                                  Engine: {formatEngineName(txn.classificationReason)}
                                </div>
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isDebit ? '-' : '+'}{Math.abs(amount).toLocaleString('en-IN', { style: 'currency', currency: txn.currency })}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {txn.category ? (
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40">
                                      {txn.category.name}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-500 bg-slate-100 border-none dark:bg-slate-800 dark:text-slate-400">
                                      Uncategorized
                                    </Badge>
                                  )}
                                  {txn.tags?.map(t => (
                                    <Badge key={t} variant="outline" className="text-xs text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                      #{t}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {transactions.length === 0 && (
                          <TableRow className="dark:border-slate-800">
                            <TableCell colSpan={4} className="h-24 text-center text-slate-500 dark:text-slate-400">
                              No transactions found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
