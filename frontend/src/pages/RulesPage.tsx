import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  RefreshCw,
  Shield,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { RuleFormModal, RuleFormData } from '@/components/rules/RuleFormModal';
import { RulesTable, ClassificationRuleItem } from '@/components/rules/RulesTable';
import { CategoryOption } from '@/components/transactions/TransactionEditDrawer';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<ClassificationRuleItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'SYSTEM' | 'USER' | 'AI_LEARNED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleFormData | null>(null);

  const fetchRulesAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, catsRes] = await Promise.all([
        apiClient.get<ClassificationRuleItem[]>('/rules'),
        apiClient.get<CategoryOption[]>('/transactions/categories/all'),
      ]);
      setRules(rulesRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error('Failed to load rules:', err);
      toast.error('Failed to load classification rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRulesAndCategories();
  }, [fetchRulesAndCategories]);

  // Handle Save / Create / Edit Rule
  const handleSaveRule = async (data: RuleFormData) => {
    try {
      const conditionsPayload: any = {
        field: data.field,
        operator: data.operator,
        value: data.value,
      };

      if (data.direction && data.direction !== 'ALL') {
        conditionsPayload.direction = data.direction;
      }
      if (data.amountLessThan !== undefined) {
        conditionsPayload.amountLessThan = data.amountLessThan;
      }
      if (data.amountGreaterThan !== undefined) {
        conditionsPayload.amountGreaterThan = data.amountGreaterThan;
      }

      if (data.id) {
        // Edit existing rule
        const res = await apiClient.patch(`/rules/${data.id}`, {
          name: data.name,
          conditions: conditionsPayload,
          categoryId: data.categoryId,
          tags: data.tags,
          priority: data.priority,
          isActive: data.isActive,
        });
        toast.success(`Rule "${data.name}" updated successfully`);
        setRules((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...res.data } : r)));
      } else {
        // Create new rule
        const res = await apiClient.post('/rules', {
          name: data.name,
          conditions: conditionsPayload,
          categoryId: data.categoryId,
          tags: data.tags,
          priority: data.priority,
          isActive: data.isActive,
        });
        toast.success(`Rule "${data.name}" created successfully`);
        setRules((prev) => [res.data, ...prev]);
      }
      setEditingRule(null);
    } catch (err) {
      console.error('Failed to save rule:', err);
      toast.error('Failed to save rule. Please check input parameters.');
      throw err;
    }
  };

  // Handle Delete
  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this classification rule?')) return;
    try {
      await apiClient.delete(`/rules/${id}`);
      toast.success('Rule deleted successfully');
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete rule:', err);
      toast.error('Failed to delete rule');
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await apiClient.patch(`/rules/${id}`, { isActive: !currentState });
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !currentState } : r)),
      );
      toast.success(`Rule ${!currentState ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error('Failed to toggle rule state:', err);
      toast.error('Failed to toggle rule');
    }
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (sourceFilter === 'SYSTEM' && (!r.isSystem && r.source !== 'SYSTEM')) return false;
      if (sourceFilter === 'USER' && (r.isSystem || r.source !== 'USER')) return false;
      if (sourceFilter === 'AI_LEARNED' && r.source !== 'AI_LEARNED') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(q);
      const categoryMatch = (r.category?.name || '').toLowerCase().includes(q);
      const tagMatch = r.tags.some((t) => t.toLowerCase().includes(q));
      const condString = JSON.stringify(r.conditions).toLowerCase();
      const condMatch = condString.includes(q);

      return nameMatch || categoryMatch || tagMatch || condMatch;
    });
  }, [rules, sourceFilter, searchQuery]);

  // Summary Metrics
  const { totalHits, userCount, systemCount, aiCount } = useMemo(() => {
    let hits = 0;
    let user = 0;
    let system = 0;
    let ai = 0;

    rules.forEach((r) => {
      hits += r.hitCount || 0;
      if (r.isSystem || r.source === 'SYSTEM') system++;
      else if (r.source === 'AI_LEARNED') ai++;
      else user++;
    });

    return { totalHits: hits, userCount: user, systemCount: system, aiCount: ai };
  }, [rules]);

  // Open Modal for Edit
  const openEditModal = (rule: ClassificationRuleItem) => {
    const c = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions || {};
    setEditingRule({
      id: rule.id,
      name: rule.name,
      field: c.field === 'description' ? 'description' : 'normalizedDescription',
      operator: c.operator || 'contains',
      value: c.value || c.normalizedMerchantContains || c.descriptionContains || c.keyword || '',
      direction: c.direction || 'ALL',
      amountLessThan: c.amountLessThan,
      amountGreaterThan: c.amountGreaterThan,
      categoryId: rule.categoryId,
      tags: rule.tags || [],
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Deterministic Rule Engine
            <Zap className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tier-1 compound classification rules that evaluate instantly with 100% precision before LLM fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRulesAndCategories}
            className="h-8 gap-2 text-xs font-medium"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Rule</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{rules.length}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active classification patterns</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
              <User className="h-3 w-3" /> User Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{userCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Custom user rules</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Auto-Learned
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{aiCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Generated from edits</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
              <Shield className="h-3 w-3" /> System Seed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{systemCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{totalHits} total classifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Rules Table Card */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Classification Rules
              </CardTitle>
              <CardDescription className="text-xs">
                {filteredRules.length} rules matched
              </CardDescription>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search rules, merchants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-muted/30"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setSourceFilter('ALL')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    sourceFilter === 'ALL'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({rules.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter('USER')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    sourceFilter === 'USER'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Rules ({userCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter('AI_LEARNED')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    sourceFilter === 'AI_LEARNED'
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Auto-Learned ({aiCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter('SYSTEM')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    sourceFilter === 'SYSTEM'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  System ({systemCount})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <RulesTable
            rules={filteredRules}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDeleteRule}
            onToggleActive={handleToggleActive}
          />
        </CardContent>
      </Card>

      {/* Create / Edit Rule Modal */}
      <RuleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        initialData={editingRule}
        categories={categories}
      />
    </div>
  );
};
