import React, { useState, useEffect } from 'react';
import apiClient from '@/config/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetProgressBar, BudgetProgressBarProps } from '@/components/budgets/BudgetProgressBar';
import { CreateBudgetModal } from '@/components/budgets/CreateBudgetModal';
import { toast } from 'sonner';
import {
  Sparkles,
  Plus,
  Loader2,
  Wallet,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
}

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetProgressBarProps[]>([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpend: 0,
    remainingBudget: 0,
    overallPercentageConsumed: 0,
    overBudgetCount: 0,
    warningCount: 0,
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestingAI, setIsSuggestingAI] = useState(false);
  const [aiSuggestionText, setAiSuggestionText] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/budgets');
      setBudgets(res.data.budgets || []);
      setSummary(res.data.summary || {
        totalBudget: 0,
        totalSpend: 0,
        remainingBudget: 0,
        overallPercentageConsumed: 0,
        overBudgetCount: 0,
        warningCount: 0,
      });
    } catch {
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/transactions/categories');
      setCategories(res.data || []);
    } catch {
      // Fallback categories if empty
      setCategories([
        { id: 'cat-food', name: 'Food & Dining' },
        { id: 'cat-shopping', name: 'Shopping' },
        { id: 'cat-transport', name: 'Transport' },
        { id: 'cat-util', name: 'Utilities & Bills' },
        { id: 'cat-ent', name: 'Entertainment' },
        { id: 'cat-health', name: 'Health & Medical' },
      ]);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const handleCreateBudget = async (dto: { categoryId: string; amount: number; period: 'MONTHLY' }) => {
    await apiClient.post('/budgets', dto);
    toast.success('Budget limit set successfully');
    await fetchBudgets();
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await apiClient.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      await fetchBudgets();
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const handleSuggestBudgetsAI = async () => {
    try {
      setIsSuggestingAI(true);
      const res = await apiClient.post('/copilot/ask', {
        question: 'Suggest realistic monthly budgets for my spending categories based on historical habits.',
      });
      setAiSuggestionText(res.data.answer || 'Suggested budget recommendations generated based on historical data.');
      toast.success('Copilot analyzed your spending and generated budget suggestions!');
    } catch {
      toast.error('Could not generate AI suggestions at this time');
    } finally {
      setIsSuggestingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with AI Recommender */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Budget Manager & Recommender
          </h2>
          <p className="text-xs text-muted-foreground">
            Copilot analyzes rolling 90-day expenses and sets realistic category targets with automated warnings.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestBudgetsAI}
            disabled={isSuggestingAI}
            className="gap-1.5 text-xs font-medium"
          >
            <Sparkles className={`h-3.5 w-3.5 text-primary ${isSuggestingAI ? 'animate-spin' : ''}`} />
            {isSuggestingAI ? 'Analyzing...' : 'Auto-Suggest Budgets'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Budget Limit
          </Button>
        </div>
      </div>

      {/* AI Suggestions Box (when available) */}
      {aiSuggestionText && (
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-xs text-foreground flex-1">
              <div className="font-semibold flex items-center justify-between">
                <span>Copilot Budget Recommendation</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiSuggestionText(null)}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {aiSuggestionText}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Total Monthly Budget</span>
              <div className="text-xl font-extrabold text-foreground mt-0.5">
                ₹{summary.totalBudget.toLocaleString('en-IN')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Month-to-Date Spend</span>
              <div className="text-xl font-extrabold text-foreground mt-0.5">
                ₹{summary.totalSpend.toLocaleString('en-IN')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Remaining Surplus</span>
              <div className="text-xl font-extrabold text-foreground mt-0.5">
                ₹{summary.remainingBudget.toLocaleString('en-IN')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${summary.overallPercentageConsumed >= 80 ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Overall Consumption</span>
              <div className="text-xl font-extrabold text-foreground mt-0.5">
                {summary.overallPercentageConsumed}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Calculating live category expenditures...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] border border-dashed rounded-xl p-8 text-center space-y-3 bg-muted/20">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No category budgets established yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Define target spending caps for your essential and discretionary categories, or let AI suggest targets based on past statements.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Create First Budget
            </Button>
            <Button size="sm" variant="outline" onClick={handleSuggestBudgetsAI} className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Auto-Suggest with AI
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <BudgetProgressBar
              key={b.id}
              {...b}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBudget}
        categories={categories}
      />
    </div>
  );
};
