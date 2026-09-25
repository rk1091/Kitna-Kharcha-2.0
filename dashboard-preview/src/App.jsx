import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
  UploadCloud,
  Layers,
  Lock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Sliders,
  X,
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';

const THEMES = [
  {
    id: 'stealth',
    name: 'Midnight Stealth',
    concept: 'Privacy-First Vault',
    accentColor: '#a855f7',
    bgPreview: '#090a0f',
    fontLabel: 'Inter + JetBrains Mono',
    badge: 'Cypherpunk'
  },
  {
    id: 'solar',
    name: 'Solar Intelligence',
    concept: 'High-Energy Growth',
    accentColor: '#f97316',
    bgPreview: '#fbf9f5',
    fontLabel: 'Plus Jakarta + Space Grotesk',
    badge: 'Productivity'
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    concept: 'Anxiety-Free Minimalist',
    accentColor: '#0284c7',
    bgPreview: '#f0f4f9',
    fontLabel: 'Inter Minimal',
    badge: 'Zen Flow'
  },
  {
    id: 'eco',
    name: 'Eco Wealth',
    concept: 'Prosperity & Sustainable Growth',
    accentColor: '#10b981',
    bgPreview: '#071911',
    fontLabel: 'Outfit + JetBrains Mono',
    badge: 'Wealth'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'txn-1',
    rawDescription: ': RAZ*SwiggyBangalore C',
    cleanMerchant: 'Swiggy',
    category: 'Food & Dining',
    categoryColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    amount: -450.00,
    date: 'Today, 2:15 PM',
    account: 'HDFC •••• 4892',
    tier: 'Tier 1: Regex Match',
    tierNum: 1,
    confidence: '100%',
    engineNote: 'Matched local keyword substring "swiggy" directly. Zero tokens, 0ms latency.',
    maskedPII: 'RAZ*SWIGGY••••••••'
  },
  {
    id: 'txn-2',
    rawDescription: '00: EMINYKAA VIA SMARTBUYMUMBRA C',
    cleanMerchant: 'Nykaa',
    category: 'Shopping & Care',
    categoryColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    amount: -3299.00,
    date: 'Yesterday, 8:40 PM',
    account: 'SBI •••• 1044',
    tier: 'Tier 3: LLM Refined',
    tierNum: 3,
    confidence: '98%',
    engineNote: 'Processed via Gemini Structured Classifier. Stripped gateway noise and detected e-commerce cosmetics subcategory.',
    maskedPII: 'EMINYKAA••••••••'
  },
  {
    id: 'txn-3',
    rawDescription: 'WWW DINEOUT CO INGURGAON C',
    cleanMerchant: 'Dineout',
    category: 'Food & Dining',
    categoryColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    amount: -1840.00,
    date: '23 Sep, 9:15 PM',
    account: 'ICICI •••• 9921',
    tier: 'Tier 1: Regex Match',
    tierNum: 1,
    confidence: '100%',
    engineNote: 'Domain wrapper stripped (WWW ... CO IN) and matched "dineout" rule.',
    maskedPII: 'DINEOUT••••••••'
  },
  {
    id: 'txn-4',
    rawDescription: 'IGL*INDRAPRASTHA GAS LTD NEW DELHI',
    cleanMerchant: 'Indraprastha Gas',
    category: 'Utilities & Bills',
    categoryColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    amount: -820.00,
    date: '21 Sep, 11:10 AM',
    account: 'HDFC •••• 4892',
    tier: 'Tier 2: Pattern Sync',
    tierNum: 2,
    confidence: '94%',
    engineNote: 'Matched recurring utility bill pattern and utility MCC code.',
    maskedPII: 'IGL*••••••••'
  },
  {
    id: 'txn-5',
    rawDescription: 'SALARY CREDIT ACME TECH CORP NEFT',
    cleanMerchant: 'Acme Tech Corp',
    category: 'Income',
    categoryColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amount: 145000.00,
    date: '01 Sep, 10:00 AM',
    account: 'HDFC •••• 4892',
    tier: 'Tier 1: Regex Match',
    tierNum: 1,
    confidence: '100%',
    engineNote: 'Identified corporate salary NEFT credit pattern.',
    maskedPII: 'ACME TECH••••••••'
  },
  {
    id: 'txn-6',
    rawDescription: 'AMZN PRIME VIDEO IN MUMBAI VIA UPI',
    cleanMerchant: 'Amazon Prime',
    category: 'Entertainment',
    categoryColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    amount: -299.00,
    date: '19 Sep, 4:20 PM',
    account: 'HDFC •••• 4892',
    tier: 'Tier 3: LLM Refined',
    tierNum: 3,
    confidence: '99%',
    engineNote: 'Disambiguated Amazon retail vs Prime subscription stream based on recurring billing interval.',
    maskedPII: 'AMZN PRIME••••••••'
  }
];

export default function App() {
  const [theme, setTheme] = useState('stealth');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [maskMerchantPII, setMaskMerchantPII] = useState(false);
  const [filterTier, setFilterTier] = useState('all');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [appliedStrategy, setAppliedStrategy] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  const filteredTransactions = INITIAL_TRANSACTIONS.filter((t) => {
    if (filterTier === 'all') return true;
    if (filterTier === 'tier1') return t.tierNum === 1;
    if (filterTier === 'tier2') return t.tierNum === 2;
    if (filterTier === 'tier3') return t.tierNum === 3;
    return true;
  });

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2400);
  };

  return (
    <div className="min-h-screen text-theme-text-base pb-16 selection:bg-theme-primary/30">
      {/* Top Notification / Security Bar */}
      <div className="border-b border-theme-border bg-theme-surface/70 backdrop-blur-md px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-theme-text-muted">
            Zero-Cloud Vault Active • Hardware-Encrypted Local Session
          </span>
          <span className="hidden sm:inline text-theme-text-muted/60">•</span>
          <span className="hidden sm:inline font-num text-theme-text-muted/80">AES-256 GCM</span>
        </div>
        <div className="flex items-center gap-4 text-theme-text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Privacy Score: <strong className="text-emerald-500 font-num">98% Optimal</strong></span>
          </div>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Mumbai Node (Localhost)</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="px-6 py-5 border-b border-theme-border bg-theme-surface/40 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: activeThemeMeta.accentColor }}
            >
              <Lock size={22} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Kitna Kharcha 2.0</h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border border-theme-border bg-theme-surface font-num">
                  v2.4 Tiered AI
                </span>
              </div>
              <p className="text-xs text-theme-text-muted mt-0.5">
                Privacy-First Financial Intelligence • Local OCR & Substring Normalization
              </p>
            </div>
          </div>

          {/* Action Center: Dynamic Theme Switcher & Privacy Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Selector Pill */}
            <div className="flex items-center gap-1 p-1 rounded-2xl border border-theme-border bg-theme-surface shadow-inner">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-theme-surface-hover text-theme-text-base shadow-sm ring-1 ring-theme-border'
                        : 'text-theme-text-muted hover:text-theme-text-base'
                    }`}
                    title={`${t.name}: ${t.concept} (${t.fontLabel})`}
                  >
                    <span
                      className="w-3 h-3 rounded-full transition-transform"
                      style={{
                        backgroundColor: t.accentColor,
                        boxShadow: isActive ? `0 0 8px ${t.accentColor}` : 'none',
                        transform: isActive ? 'scale(1.15)' : 'scale(1)'
                      }}
                    />
                    <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Incognito / Privacy Blur Toggle */}
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 shadow-sm ${
                privacyMode
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 ring-2 ring-emerald-500/20'
                  : 'bg-theme-surface border-theme-border text-theme-text-muted hover:text-theme-text-base hover:bg-theme-surface-hover'
              }`}
            >
              {privacyMode ? (
                <>
                  <EyeOff size={16} className="text-emerald-500 animate-pulse" />
                  <span>Incognito Blur: ON</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>Incognito Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Theme Showcase Banner */}
        <section className="p-4 rounded-2xl border border-theme-border bg-theme-surface/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: activeThemeMeta.accentColor + '20', color: activeThemeMeta.accentColor }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{activeThemeMeta.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  {activeThemeMeta.badge}
                </span>
              </div>
              <p className="text-xs text-theme-text-muted">
                {activeThemeMeta.concept} • Typography: <span className="font-medium text-theme-text-base">{activeThemeMeta.fontLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-theme-card px-3 py-1.5 rounded-lg border border-theme-border hover:bg-theme-surface-hover">
              <input
                type="checkbox"
                checked={maskMerchantPII}
                onChange={(e) => setMaskMerchantPII(e.target.checked)}
                className="rounded accent-theme-primary"
              />
              <span className="text-theme-text-muted">Mask Merchant PII</span>
            </label>
            <span className="text-theme-text-muted text-[11px] hidden sm:inline">
              (Hover blurred figures to reveal)
            </span>
          </div>
        </section>

        {/* Financial Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Spent */}
          <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm relative overflow-hidden group hover:border-theme-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-theme-text-muted mb-2">
              <span className="font-medium">Total Monthly Spend</span>
              <span className="flex items-center gap-0.5 text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full font-num">
                <TrendingDown size={13} /> -12%
              </span>
            </div>
            <div className={`text-2xl lg:text-3xl font-bold font-num tracking-tight ${privacyMode ? 'privacy-blur' : ''}`}>
              ₹42,850.00
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-theme-text-muted">
              <span>vs ₹48,690 last month</span>
              <span className="text-theme-primary font-medium">Safe Budget</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary/30 to-transparent" />
          </div>

          {/* AI Savings */}
          <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm relative overflow-hidden group hover:border-theme-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-theme-text-muted mb-2">
              <span className="font-medium">AI Insights Savings</span>
              <span className="flex items-center gap-0.5 text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full font-num">
                <TrendingUp size={13} /> +₹4,200
              </span>
            </div>
            <div className={`text-2xl lg:text-3xl font-bold font-num tracking-tight text-emerald-500 ${privacyMode ? 'privacy-blur' : ''}`}>
              ₹4,200.00
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-theme-text-muted">
              <span>Via recurring audit</span>
              <span className="text-emerald-500 font-medium">3 Subscriptions Optimized</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
          </div>

          {/* Privacy Score */}
          <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm relative overflow-hidden group hover:border-theme-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-theme-text-muted mb-2">
              <span className="font-medium">Zero-Cloud Privacy Vault</span>
              <span className="text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full font-num">
                Optimal
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-num tracking-tight flex items-baseline gap-2">
              <span>98%</span>
              <span className="text-xs font-normal text-theme-text-muted">Leak Proof</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-theme-text-muted">
              <span>0% Cloud egress</span>
              <span className="text-emerald-500 font-medium">Hardware Encrypted</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
          </div>

          {/* Net Liquidity */}
          <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm relative overflow-hidden group hover:border-theme-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-theme-text-muted mb-2">
              <span className="font-medium">Net Liquid Position</span>
              <span className="text-theme-primary font-semibold bg-theme-primary/10 px-2 py-0.5 rounded-full font-num">
                2 Bank Accounts
              </span>
            </div>
            <div className={`text-2xl lg:text-3xl font-bold font-num tracking-tight ${privacyMode ? 'privacy-blur' : ''}`}>
              ₹2,18,430.00
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-theme-text-muted">
              <span>HDFC & SBI Connected</span>
              <span className="text-theme-text-base font-medium">EOM On Track</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/40 to-transparent" />
          </div>
        </section>

        {/* 2-Column Core Architecture: Transactions + AI Insight / Upload */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Tiered AI Transaction Intelligence Feed */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-sm space-y-5">
              {/* Card Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-theme-primary" />
                    <h2 className="text-lg font-bold">Tiered AI Transaction Feed</h2>
                  </div>
                  <p className="text-xs text-theme-text-muted mt-0.5">
                    Multi-stage pipeline: Tier 1 (Regex & Substrings) $\rightarrow$ Tier 2 (Patterns) $\rightarrow$ Tier 3 (LLM)
                  </p>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-xl border border-theme-border text-xs">
                  <button
                    onClick={() => setFilterTier('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filterTier === 'all'
                        ? 'bg-theme-surface-hover text-theme-text-base font-semibold shadow-sm'
                        : 'text-theme-text-muted hover:text-theme-text-base'
                    }`}
                  >
                    All ({INITIAL_TRANSACTIONS.length})
                  </button>
                  <button
                    onClick={() => setFilterTier('tier1')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filterTier === 'tier1'
                        ? 'bg-theme-surface-hover text-theme-text-base font-semibold shadow-sm'
                        : 'text-theme-text-muted hover:text-theme-text-base'
                    }`}
                  >
                    Tier 1 (Regex)
                  </button>
                  <button
                    onClick={() => setFilterTier('tier2')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filterTier === 'tier2'
                        ? 'bg-theme-surface-hover text-theme-text-base font-semibold shadow-sm'
                        : 'text-theme-text-muted hover:text-theme-text-base'
                    }`}
                  >
                    Tier 2 (ML)
                  </button>
                  <button
                    onClick={() => setFilterTier('tier3')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filterTier === 'tier3'
                        ? 'bg-theme-surface-hover text-theme-text-base font-semibold shadow-sm'
                        : 'text-theme-text-muted hover:text-theme-text-base'
                    }`}
                  >
                    Tier 3 (LLM)
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.map((txn) => {
                  const isDebit = txn.amount < 0;
                  return (
                    <div
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className="group p-4 rounded-2xl border border-theme-border bg-theme-surface/60 hover:bg-theme-surface-hover transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-theme-primary/30"
                    >
                      {/* Left side: Merchant & Raw info */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-theme-border bg-theme-card font-num`}
                        >
                          {txn.cleanMerchant.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {maskMerchantPII ? txn.maskedPII : txn.cleanMerchant}
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${txn.categoryColor}`}
                            >
                              {txn.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-theme-text-muted font-num">
                            <span>{txn.date}</span>
                            <span>•</span>
                            <span>{txn.account}</span>
                          </div>
                          <div className="text-[11px] text-theme-text-muted/70 font-mono truncate max-w-xs sm:max-w-md">
                            raw: {txn.rawDescription}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Amount & Tier Badge */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 shrink-0">
                        <div
                          className={`font-num font-bold text-base sm:text-right ${
                            isDebit ? 'text-theme-text-base' : 'text-emerald-500'
                          } ${privacyMode ? 'privacy-blur' : ''}`}
                          title={privacyMode ? 'Hover to reveal' : undefined}
                        >
                          {isDebit ? `-₹${Math.abs(txn.amount).toLocaleString('en-IN')}` : `+₹${txn.amount.toLocaleString('en-IN')}`}
                        </div>

                        {/* Tier Badge Visual Representation */}
                        {txn.tierNum === 1 && (
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-theme-border bg-theme-card text-theme-text-muted">
                            {txn.tier}
                          </span>
                        )}

                        {txn.tierNum === 2 && (
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-num">
                            {txn.tier} • {txn.confidence}
                          </span>
                        )}

                        {txn.tierNum === 3 && (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full shimmer-badge border border-purple-500/40 text-purple-200 flex items-center gap-1">
                            <Sparkles size={11} className="text-pink-300" />
                            {txn.tier}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom helper */}
              <div className="pt-2 flex items-center justify-between text-xs text-theme-text-muted">
                <span className="flex items-center gap-1">
                  <Info size={13} />
                  Click any transaction to inspect how the Tiered AI Engine made its decision.
                </span>
                <span className="font-num text-theme-primary font-medium hover:underline cursor-pointer">
                  Export Audit Log
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): AI Insight Panel + Local Statement Upload */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Insight Box */}
            <div className="p-6 rounded-3xl border border-theme-border bg-gradient-to-br from-theme-card to-theme-surface shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-theme-primary/20 text-theme-primary">
                  <Sparkles size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                  Copilot Financial Insight
                </span>
              </div>

              <h3 className="text-base font-semibold leading-snug">
                Weekend Dining Out Anomaly
              </h3>
              <p className="text-xs text-theme-text-muted mt-2 leading-relaxed">
                "We noticed you spend <strong className="text-theme-text-base">24% more</strong> on weekends via food apps. A soft ceiling on Saturdays would preserve ~₹3,500/mo."
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => setAppliedStrategy(!appliedStrategy)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-theme-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
                >
                  {appliedStrategy ? (
                    <>
                      <CheckCircle2 size={14} />
                      Strategy Active
                    </>
                  ) : (
                    <>
                      Apply Weekend Ceiling
                      <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => alert("Insight snoozed for 14 days.")}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-theme-text-muted hover:text-theme-text-base hover:bg-theme-surface transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {appliedStrategy && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Saturday ₹1,500 spending alert threshold configured.</span>
                </div>
              )}
            </div>

            {/* Local Bank Statement Upload Dropzone */}
            <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud size={18} className="text-theme-primary" />
                  <h3 className="text-sm font-bold">Local Statement Ingest</h3>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  On-Device OCR
                </span>
              </div>

              {/* Upload Drop area */}
              <div
                onClick={handleSimulateUpload}
                className="border-2 border-dashed border-theme-border hover:border-theme-primary/60 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-theme-surface/40 hover:bg-theme-surface relative overflow-hidden group"
              >
                {isUploading && (
                  <div className="absolute inset-x-0 h-1 bg-theme-primary animate-scan z-10 top-0 shadow-lg" />
                )}

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <Zap size={22} className="animate-spin text-theme-primary" />
                    ) : (
                      <FileText size={22} />
                    )}
                  </div>
                  {isUploading ? (
                    <div>
                      <span className="text-xs font-semibold text-theme-primary">
                        Scanning statement locally...
                      </span>
                      <p className="text-[11px] text-theme-text-muted mt-0.5">
                        Tokenizing PDF tables & masking PII
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold">
                        Drop Bank PDF / CSV or Click to Browse
                      </span>
                      <p className="text-[11px] text-theme-text-muted mt-0.5">
                        Supports HDFC, ICICI, SBI, Axis, Kotak statements
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Engine Breakdown stats */}
              <div className="pt-2 space-y-2 border-t border-theme-border text-xs">
                <div className="flex justify-between text-theme-text-muted">
                  <span>Engine Speed:</span>
                  <span className="font-num text-theme-text-base">142 txns/sec</span>
                </div>
                <div className="flex justify-between text-theme-text-muted">
                  <span>Tier 1 Regex Match Rate:</span>
                  <span className="font-num text-emerald-500 font-medium">62% (0 tokens)</span>
                </div>
                <div className="flex justify-between text-theme-text-muted">
                  <span>Tier 3 LLM Disambiguation:</span>
                  <span className="font-num text-purple-400 font-medium">14% (Batched)</span>
                </div>
              </div>
            </div>

            {/* Quick Rule Creator Simulator */}
            <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/40 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-theme-primary/15 text-theme-primary">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="font-semibold">Copilot Rule Dispatcher</div>
                  <div className="text-[11px] text-theme-text-muted">
                    "Always mark Swiggy as Food & Dining"
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-theme-text-muted" />
            </div>
          </div>
        </section>
      </main>

      {/* Transaction Detail & AI Engine Inspector Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-theme-border bg-theme-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary">
                  {selectedTxn.tier}
                </span>
                <h3 className="text-xl font-bold mt-0.5">{selectedTxn.cleanMerchant}</h3>
                <p className="text-xs text-theme-text-muted">{selectedTxn.date}</p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-full hover:bg-theme-surface text-theme-text-muted hover:text-theme-text-base transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Amount & Classification */}
            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border flex items-center justify-between">
              <div>
                <span className="text-xs text-theme-text-muted">Signed Amount</span>
                <div className="text-2xl font-bold font-num">
                  ₹{Math.abs(selectedTxn.amount).toLocaleString('en-IN')}
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-xl border ${selectedTxn.categoryColor}`}>
                {selectedTxn.category}
              </span>
            </div>

            {/* AI Decision Pipeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                Pipeline Decision Log
              </h4>

              <div className="p-3.5 rounded-xl bg-theme-surface/70 border border-theme-border text-xs space-y-2">
                <div>
                  <span className="text-theme-text-muted block text-[11px]">Raw Bank String:</span>
                  <code className="text-theme-primary font-mono text-[11px] block mt-0.5 bg-black/20 p-1.5 rounded border border-white/5 break-all">
                    {selectedTxn.rawDescription}
                  </code>
                </div>

                <div className="pt-2 border-t border-theme-border/50">
                  <span className="text-theme-text-muted block text-[11px]">Engine Explanation:</span>
                  <p className="mt-1 text-theme-text-base leading-relaxed">
                    {selectedTxn.engineNote}
                  </p>
                </div>

                <div className="pt-2 border-t border-theme-border/50 flex items-center justify-between text-[11px]">
                  <span className="text-theme-text-muted">Model Confidence:</span>
                  <span className="font-semibold text-emerald-400 font-num">{selectedTxn.confidence}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Created custom rule: Always assign "${selectedTxn.cleanMerchant}" to ${selectedTxn.category}`);
                  setSelectedTxn(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-theme-primary text-white hover:opacity-95 transition-opacity text-center shadow-md"
              >
                Save as Classification Rule
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-medium border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
