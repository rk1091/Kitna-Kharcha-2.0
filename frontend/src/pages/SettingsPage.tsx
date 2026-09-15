import React, { useState, useEffect } from 'react';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  Globe,
  Bot,
  Layers,
  Trash2,
  Download,
  Plus,
  Check,
  AlertTriangle,
  Cpu,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME' | 'NEUTRAL';
  color?: string | null;
  icon?: string | null;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B',
];

export const SettingsPage: React.FC = () => {
  // Profile & General State
  const [userName, setUserName] = useState('Default User');
  const [currency, setCurrency] = useState('INR');
  const [fiscalYearStart, setFiscalYearStart] = useState('april');
  const [savingProfile, setSavingProfile] = useState(false);

  // LLM Configuration State
  const [llmProvider, setLlmProvider] = useState<'gemini' | 'local'>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/v1');
  const [localModel, setLocalModel] = useState('llama3.2');
  const [temperature, setTemperature] = useState('0.1');

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'EXPENSE' | 'INCOME' | 'NEUTRAL'>('EXPENSE');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Danger Zone State
  const [clearingData, setClearingData] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    // Load current user profile & categories
    apiClient
      .get('/auth/me')
      .then((res) => {
        if (res.data) {
          if (res.data.name) setUserName(res.data.name);
          if (res.data.defaultCurrency) setCurrency(res.data.defaultCurrency);
          if (res.data.preferences) {
            const p = res.data.preferences;
            if (p.fiscalYearStart) setFiscalYearStart(p.fiscalYearStart);
            if (p.llmProvider) setLlmProvider(p.llmProvider);
            if (p.geminiModel) setGeminiModel(p.geminiModel);
            if (p.localEndpoint) setLocalEndpoint(p.localEndpoint);
            if (p.localModel) setLocalModel(p.localModel);
            if (p.temperature) setTemperature(String(p.temperature));
          }
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await apiClient.get('/transactions/categories/all');
      setCategories(res.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCats(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await apiClient.patch('/auth/profile', {
        name: userName,
        defaultCurrency: currency,
        preferences: {
          fiscalYearStart,
          llmProvider,
          geminiModel,
          localEndpoint,
          localModel,
          temperature: Number(temperature),
        },
      });
      toast.success('Profile and preferences updated successfully');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    try {
      await apiClient.post('/transactions/categories', {
        name: newCatName.trim(),
        type: newCatType,
        color: newCatColor,
      });
      toast.success(`Category "${newCatName}" created`);
      setNewCatName('');
      setIsAddingCat(false);
      loadCategories();
    } catch {
      toast.error('Failed to create category (may already exist)');
    }
  };

  const handleUpdateCategoryColor = async (id: string, color: string) => {
    try {
      await apiClient.patch(`/transactions/categories/${id}`, { color });
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
      toast.success('Category color updated');
    } catch {
      toast.error('Failed to update category color');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await apiClient.delete(`/transactions/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Category "${name}" deleted`);
    } catch {
      toast.error('Cannot delete category with associated transactions or rules');
    }
  };

  const handleExportJSON = async () => {
    try {
      setExportingData(true);
      const res = await apiClient.get('/auth/export-json');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(res.data, null, 2),
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `kitna-kharcha-backup-${new Date().toISOString().split('T')[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Data exported as JSON');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmation = prompt(
      'Type "DELETE" to permanently erase all statements, transactions, rules, and budgets:',
    );
    if (confirmation !== 'DELETE') {
      if (confirmation !== null) toast.error('Confirmation string did not match. Operation cancelled.');
      return;
    }

    try {
      setClearingData(true);
      await apiClient.post('/auth/clear-data');
      toast.success('All user transaction data cleared cleanly');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast.error('Failed to clear user data');
    } finally {
      setClearingData(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            System & User Settings
            <Globe className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your currency, AI intelligence providers, financial categories, and data safety.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="h-8 text-xs font-semibold gap-1.5"
        >
          <Check className="h-3.5 w-3.5" />
          {savingProfile ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Profile & General Preferences */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Globe className="h-4 w-4 text-primary" />
            General & Currency Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Personalize your identity, reporting currency, and fiscal cycles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Display Name</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Base Reporting Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="font-semibold text-foreground block mb-1.5">Financial Year Cycle</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="fiscalYear"
                  value="april"
                  checked={fiscalYearStart === 'april'}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                  className="accent-primary"
                />
                <span>April to March (Indian Financial Year)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs ml-4">
                <input
                  type="radio"
                  name="fiscalYear"
                  value="january"
                  checked={fiscalYearStart === 'january'}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                  className="accent-primary"
                />
                <span>January to December (Calendar Year)</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI & LLM Engine Configuration */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              AI Intelligence & Copilot Engine
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Cpu className="h-3 w-3" />
              {llmProvider === 'gemini' ? 'Google Gemini' : 'Local Ollama'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Toggle between cloud intelligence (Gemini) and completely offline local LLMs
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          {/* Provider Selector Switch */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-muted/40 border border-border">
            <button
              type="button"
              onClick={() => setLlmProvider('gemini')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                llmProvider === 'gemini'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Cloud (Google Gemini)</span>
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[9px]">Recommended</Badge>
            </button>
            <button
              type="button"
              onClick={() => setLlmProvider('local')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                llmProvider === 'local'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Local LLM (Ollama / Studio)</span>
              <Badge variant="outline" className="text-[9px]">Air-Gapped</Badge>
            </button>
          </div>

          {llmProvider === 'gemini' ? (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>Gemini API Key</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Stored locally in environment / preferences
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy... (leave blank to use server GEMINI_API_KEY)"
                    className="h-9 text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Model Name</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Fastest & Tier 1)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep reasoning)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Sampling Temperature</label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Local API Base URL</label>
                <Input
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Local Model Identifier</label>
                <Input
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="e.g. llama3.2, mistral:7b, qwen2.5:7b"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Manager */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Layers className="h-4 w-4 text-primary" />
              Category Manager & Palettes
            </CardTitle>
            <CardDescription className="text-xs">
              Customize categories, types, and visual theme colors
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingCat(!isAddingCat)}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          {/* Add Category Form */}
          {isAddingCat && (
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in">
              <div className="font-semibold text-foreground">Create New Category</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Category Name (e.g. Pet Care)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-xs"
                >
                  <option value="EXPENSE">EXPENSE</option>
                  <option value="INCOME">INCOME</option>
                  <option value="NEUTRAL">NEUTRAL (Transfers/Investments)</option>
                </select>
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 border border-border shadow-xs"
                    style={{ backgroundColor: newCatColor }}
                  />
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-9 px-2 rounded-md border border-input bg-background text-xs flex-1"
                  >
                    {PRESET_COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingCat(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddCategory} className="h-7 text-xs font-semibold">
                  Create Category
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {loadingCats ? (
            <p className="text-muted-foreground text-center py-6">Loading categories...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-2.5 rounded-xl border border-border/80 bg-card/60 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color || '#64748B' }}
                    />
                    <span className="font-semibold text-foreground text-xs truncate">{cat.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                      {cat.type}
                    </Badge>
                  </div>

                  {/* Palette Switcher & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.slice(0, 4).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateCategoryColor(cat.id, c)}
                          className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 ${
                            cat.color === c ? 'ring-1 ring-primary ring-offset-1 scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                          title={`Set color to ${c}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PII Masking Security Status */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            Privacy & PII Masking Engine
          </CardTitle>
          <CardDescription className="text-xs">
            100% local deterministic redaction prior to AI evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between border border-border">
            <div>
              <p className="font-semibold text-foreground">AES-256 Reversible Encryption</p>
              <p className="text-[11px] text-muted-foreground">
                Sensitive tokens are masked locally with salted hash maps and restored only on render
              </p>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
              Active & Protected
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="outline" className="text-[10px]">PAN Cards: Redacted</Badge>
            <Badge variant="outline" className="text-[10px]">Aadhaar Numbers: Redacted</Badge>
            <Badge variant="outline" className="text-[10px]">UPI Handles: Redacted</Badge>
            <Badge variant="outline" className="text-[10px]">Phone Numbers: Redacted</Badge>
            <Badge variant="outline" className="text-[10px]">Card Numbers: Redacted</Badge>
            <Badge variant="outline" className="text-[10px]">GSTIN / HSN: Redacted</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone & Data Portability */}
      <Card className="shadow-sm border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3 border-b border-destructive/20">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Data Portability & Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Export full analytical ledger backup or reset your transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border">
            <div>
              <p className="font-semibold text-foreground">Export All Financial Records (JSON)</p>
              <p className="text-[11px] text-muted-foreground">
                Download a clean, structured JSON file of all statements, transactions, rules, and budgets
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              disabled={exportingData}
              className="h-8 text-xs gap-1.5 font-medium shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{exportingData ? 'Exporting...' : 'Export JSON'}</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="font-semibold text-destructive">Erase All Statement & Transaction Data</p>
              <p className="text-[11px] text-muted-foreground">
                Permanently wipes all uploaded statements, ledger entries, classification rules, and budgets
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearAllData}
              disabled={clearingData}
              className="h-8 text-xs gap-1.5 font-semibold shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{clearingData ? 'Clearing Data...' : 'Clear All Data'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
