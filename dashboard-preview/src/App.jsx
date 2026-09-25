import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  BarChart3,
  Database,
  Upload,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  Download,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import ProfessionalLogin from './Login.jsx';
import DecisionInspectorModal from './components/DecisionInspectorModal.jsx';
import StatementUploadCard from './components/StatementUploadCard.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'login'
  const [activeTheme, setActiveTheme] = useState('Foundry'); // 'Foundry' | 'Paper' | 'Sage' | 'Midnight'
  const [activeNav, setActiveNav] = useState('insights');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [activeTierFilter, setActiveTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 4 Top-Tier Executive Fintech Themes
  const themeStyles = {
    Foundry: {
      id: 'Foundry',
      name: 'Foundry Dark',
      tagline: 'Executive Grade (The "Linear" look)',
      bg: 'bg-[#09090b]',
      sidebar: 'bg-[#09090b] border-white/5',
      card: 'bg-zinc-900/50 border-white/10 text-zinc-100 shadow-xl',
      tableHeader: 'bg-white/[0.02] border-white/5 text-zinc-400',
      tableRow: 'hover:bg-white/[0.02] border-white/5',
      accent: 'text-indigo-400',
      accentBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      statTrendUp: 'text-emerald-400 bg-emerald-400/10',
      statTrendDown: 'text-amber-400 bg-amber-400/10',
      dot: '#6366f1',
      selection: 'selection:bg-indigo-500/30',
      font: 'font-sans',
      mono: 'font-mono'
    },
    Paper: {
      id: 'Paper',
      name: 'Paper Light',
      tagline: 'Clean, high-trust banking aesthetic (The "Mercury" look)',
      bg: 'bg-[#f8fafc]',
      sidebar: 'bg-[#ffffff] border-slate-200',
      card: 'bg-white border-slate-200 text-slate-800 shadow-sm',
      tableHeader: 'bg-slate-50 border-slate-200 text-slate-500',
      tableRow: 'hover:bg-slate-50/80 border-slate-100',
      accent: 'text-sky-600',
      accentBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      statTrendUp: 'text-emerald-600 bg-emerald-50',
      statTrendDown: 'text-amber-600 bg-amber-50',
      dot: '#0284c7',
      selection: 'selection:bg-sky-500/20',
      font: 'font-sans',
      mono: 'font-mono'
    },
    Sage: {
      id: 'Sage',
      name: 'Forest / Sage',
      tagline: 'Minimalist, modern wealth management',
      bg: 'bg-[#0a0f0d]',
      sidebar: 'bg-[#0a0f0d] border-emerald-950/60',
      card: 'bg-[#0f1814]/70 border-emerald-500/15 text-emerald-100 shadow-xl',
      tableHeader: 'bg-emerald-950/30 border-emerald-500/10 text-emerald-400/70',
      tableRow: 'hover:bg-emerald-950/20 border-emerald-500/10',
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      statTrendUp: 'text-emerald-400 bg-emerald-400/10',
      statTrendDown: 'text-amber-400 bg-amber-400/10',
      dot: '#10b981',
      selection: 'selection:bg-emerald-500/30',
      font: 'font-sans',
      mono: 'font-mono'
    },
    Midnight: {
      id: 'Midnight',
      name: 'Midnight AI',
      tagline: 'High-tech AI Intelligence',
      bg: 'bg-[#020420]',
      sidebar: 'bg-[#020420] border-blue-950/60',
      card: 'bg-[#070b2e]/60 border-blue-500/20 text-blue-100 shadow-2xl',
      tableHeader: 'bg-blue-950/30 border-blue-500/10 text-blue-300/70',
      tableRow: 'hover:bg-blue-950/20 border-blue-500/10',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      statTrendUp: 'text-cyan-400 bg-cyan-400/10',
      statTrendDown: 'text-amber-400 bg-amber-400/10',
      dot: '#3b82f6',
      selection: 'selection:bg-blue-500/30',
      font: 'font-sans',
      mono: 'font-mono'
    }
  };

  const s = themeStyles[activeTheme] || themeStyles.Foundry;
  const isLight = activeTheme === 'Paper';

  // INITIAL TRANSACTIONS WITH TIERED AI BREAKDOWN
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1',
      merchant: 'AWS Cloud Services',
      name: 'AWS Cloud Services',
      rawDescription: 'AMZN WEBSERVICES INC SEATTLE WA VIA US-EAST',
      category: 'Infrastructure',
      amount: '-₹8,400.00',
      price: '₹8,400.00',
      tier: 'Tier 3',
      tierLabel: 'LLM Precision',
      tierNum: 3,
      date: 'Today, 2:15 PM',
      account: 'HDFC •••• 4892',
      reasoning: 'Disambiguated cloud computing bill vs consumer retail using on-device Gemini structured prompt. 24 tokens.'
    },
    {
      id: 'tx-2',
      merchant: 'Starbucks Coffee',
      name: 'Starbucks Coffee',
      rawDescription: ': WWW STARBUCKS COFFEE INDIRANAGAR BLR',
      category: 'Lifestyle',
      amount: '-₹450.00',
      price: '₹450.00',
      tier: 'Tier 1',
      tierLabel: 'Regex Rule',
      tierNum: 1,
      date: 'Today, 11:30 AM',
      account: 'HDFC •••• 4892',
      reasoning: 'Matched compiled regex rule ^.*starbucks.*$ directly. 0ms latency, 0 tokens.'
    },
    {
      id: 'tx-3',
      merchant: 'Razorpay Payroll Credit',
      name: 'Razorpay Payroll Credit',
      rawDescription: 'NEFT CR CORP PAYROLL DISBURSEMENT SEP26',
      category: 'Income',
      amount: '+₹1,40,000.00',
      price: '₹1,40,000.00',
      tier: 'Tier 2',
      tierLabel: 'Pattern Match',
      tierNum: 2,
      date: 'Yesterday, 9:00 AM',
      account: 'SBI •••• 1044',
      reasoning: 'Matched recurring corporate salary NEFT credit pattern with 99.4% confidence.'
    },
    {
      id: 'tx-4',
      merchant: 'Uber Mobility Bangalore',
      name: 'Uber Mobility Bangalore',
      rawDescription: ': WWW UBER COM IN BENGALURU C 99042',
      category: 'Travel & Mobility',
      amount: '-₹420.00',
      price: '₹420.00',
      tier: 'Tier 1',
      tierLabel: 'Regex Rule',
      tierNum: 1,
      date: '23 Sep, 6:45 PM',
      account: 'HDFC •••• 4892',
      reasoning: 'Stripped gateway wrapper and resolved canonical merchant "Uber". 0ms latency.'
    },
    {
      id: 'tx-5',
      merchant: 'GitHub Copilot Enterprise',
      name: 'GitHub Copilot Enterprise',
      rawDescription: 'GITHUB INC SAN FRANCISCO CA SUB 29910',
      category: 'Software & Tools',
      amount: '-₹1,650.00',
      price: '₹1,650.00',
      tier: 'Tier 3',
      tierLabel: 'LLM Precision',
      tierNum: 3,
      date: '22 Sep, 3:10 PM',
      account: 'ICICI •••• 9921',
      reasoning: 'Differentiated developer tooling subscription from generic e-commerce using local context.'
    },
    {
      id: 'tx-6',
      merchant: 'Swiggy Instamart',
      name: 'Swiggy Instamart',
      rawDescription: ': RAZ*SwiggyInstamart Bangalore C',
      category: 'Groceries',
      amount: '-₹680.00',
      price: '₹680.00',
      tier: 'Tier 1',
      tierLabel: 'Regex Rule',
      tierNum: 1,
      date: '21 Sep, 8:20 PM',
      account: 'HDFC •••• 4892',
      reasoning: 'Matched "swiggy" fast keyword cache with 100% confidence. 0ms.'
    }
  ]);

  // FILTERED TRANSACTIONS
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTierFilter === 'tier1' && tx.tierNum !== 1) return false;
    if (activeTierFilter === 'tier2' && tx.tierNum !== 2) return false;
    if (activeTierFilter === 'tier3' && tx.tierNum !== 3) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.amount.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // REAL CSV EXPORT FUNCTION
  const handleExportCSV = () => {
    const headers = ['Merchant', 'Category', 'Amount', 'Tier', 'Tier_Classification', 'Date', 'Account'];
    const rows = transactions.map((t) => [
      `"${t.merchant}"`,
      `"${t.category}"`,
      `"${t.amount}"`,
      `"${t.tier}"`,
      `"${t.tierLabel}"`,
      `"${t.date}"`,
      `"${t.account}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kitna_kharcha_intelligence.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTransactionsAdded = (bankName) => {
    const newTxns = [
      {
        id: `tx-${Date.now()}-1`,
        merchant: `${bankName} Salary Inflow`,
        name: `${bankName} Salary Inflow`,
        rawDescription: `NEFT CR ${bankName.toUpperCase()} CORP PAYROLL 2026`,
        category: 'Income',
        amount: '+₹95,000.00',
        price: '₹95,000.00',
        tier: 'Tier 1',
        tierLabel: 'Regex Rule',
        tierNum: 1,
        date: 'Just Now',
        account: 'HDFC •••• 4892',
        reasoning: 'Direct match for recurring salary credit regex. 0 tokens.'
      },
      {
        id: `tx-${Date.now()}-2`,
        merchant: 'Zepto Instant Market',
        name: 'Zepto Instant Market',
        rawDescription: ': RAZ*ZeptoQuickMkt Bangalore C',
        category: 'Groceries',
        amount: '-₹340.00',
        price: '₹340.00',
        tier: 'Tier 1',
        tierLabel: 'Regex Rule',
        tierNum: 1,
        date: 'Just Now',
        account: 'HDFC •••• 4892',
        reasoning: 'Instant match for "zepto" merchant prefix.'
      }
    ];
    setTransactions((prev) => [...newTxns, ...prev]);
    setShowUploadModal(false);
  };

  const handleSaveRule = (txn) => {
    alert(`Rule persisted in SQLite: Map pattern "${txn.name}" to category "${txn.category}" via Regex (Tier 1).`);
    setSelectedTxn(null);
  };

  // IF IN LOGIN VIEW, RENDER THE PROFESSIONAL SPLIT-SCREEN AUTH
  if (currentView === 'login') {
    return (
      <ProfessionalLogin
        activeTheme={activeTheme}
        onThemeChange={(newTheme) => setActiveTheme(newTheme)}
        onLogin={() => setCurrentView('dashboard')}
      />
    );
  }

  // RENDER PROFESSIONAL FINTECH DASHBOARD
  return (
    <div className={`min-h-screen ${s.bg} ${isLight ? 'text-slate-900' : 'text-zinc-100'} font-sans ${s.selection} transition-colors duration-500`}>
      
      {/* ======================================================== */}
      {/* SIDEBAR NAVIGATION (MINIMAL & LINEAR-GRADE)               */}
      {/* ======================================================== */}
      <aside className={`fixed left-0 top-0 h-full w-64 border-r ${s.sidebar} flex flex-col p-6 hidden md:flex z-30 transition-colors`}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className={`w-7 h-7 ${s.accentBg} rounded-lg flex items-center justify-center shadow-md`}>
            <Shield size={15} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base tracking-tight">Kitna Kharcha</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-white/10 opacity-60">2.0</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5 flex-1">
          <NavItem 
            icon={<BarChart3 size={17} />} 
            label="Insights" 
            active={activeNav === 'insights'}
            onClick={() => setActiveNav('insights')}
            isLight={isLight}
            s={s}
          />
          <NavItem 
            icon={<Database size={17} />} 
            label="Transactions" 
            active={activeNav === 'transactions'}
            onClick={() => setActiveNav('transactions')}
            isLight={isLight}
            s={s}
          />
          <NavItem 
            icon={<Upload size={17} />} 
            label="Upload Statements" 
            active={activeNav === 'upload'}
            onClick={() => setShowUploadModal(true)}
            isLight={isLight}
            s={s}
          />
        </nav>

        {/* Executive Theme Switcher in Sidebar */}
        <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'} mb-2`}>
              Fintech Palette
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(themeStyles).map((key) => {
                const item = themeStyles[key];
                const isSelected = activeTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTheme(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                          : 'bg-white/15 text-white font-bold shadow-xs'
                        : isLight
                          ? 'text-slate-600 hover:bg-slate-100'
                          : 'text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                    <span className="truncate">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Shield telemetry card */}
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-white/[0.03] border-white/5'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-zinc-500'} mb-1.5`}>
              Privacy Shield
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edge Processing Active</span>
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'} mt-1`}>
              Zero Cloud Egress
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="md:ml-64 p-6 sm:p-8 lg:p-10 max-w-[1240px] mx-auto min-h-screen flex flex-col justify-between">
        
        <div>
          {/* HEADER NAV / TOP ACTIONS */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Intelligence Overview</h1>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${s.badge} font-mono`}>
                  {s.name}
                </span>
              </div>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                AI-processed ledger from 4 local bank statements • Zero external telemetry.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Privacy Blur Toggle */}
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                  privacyMode
                    ? 'bg-red-500/10 text-red-500 border-red-500/30'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Toggle Privacy Blur on sensitive figures"
              >
                {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                <span className="hidden sm:inline">{privacyMode ? 'Blurred' : 'Privacy'}</span>
              </button>

              {/* Export CSV Button */}
              <button 
                onClick={handleExportCSV}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs' 
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>

              {/* New Statement Button */}
              <button 
                onClick={() => setShowUploadModal(true)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md ${s.accentBg}`}
              >
                <Upload size={15} />
                <span>New Statement</span>
              </button>

              {/* Lock Vault Button */}
              <button
                onClick={() => setCurrentView('login')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Lock Vault & Return to Auth Screen"
              >
                <Lock size={15} />
                <span className="hidden sm:inline">Lock Vault</span>
              </button>
            </div>
          </header>

          {/* TOP ANALYTICS GRID (BENTO FINTECH CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <StatCard 
              label="Net Outflow" 
              value="₹1,24,850.00" 
              change="-8.2%" 
              trend="up" 
              subtext="vs last 30-day cycle"
              privacy={privacyMode}
              s={s}
              isLight={isLight}
            />
            <StatCard 
              label="AI Identified Savings" 
              value="₹12,400.00" 
              change="+14.1%" 
              trend="down" 
              subtext="Unused subscriptions & duplicates"
              privacy={privacyMode}
              s={s}
              isLight={isLight}
            />
            <StatCard 
              label="Statement Health" 
              value="98.2%" 
              change="Optimal" 
              trend="optimal" 
              subtext="100% on-device OCR accuracy"
              privacy={false}
              s={s}
              isLight={isLight}
            />
          </div>

          {/* ======================================================== */}
          {/* TIERED AI FEED TABLE                                     */}
          {/* ======================================================== */}
          <div className={`rounded-2xl border ${s.card} overflow-hidden shadow-sm`}>
            {/* Table Header Filter Bar */}
            <div className={`p-4 sm:p-5 border-b ${s.tableRow} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Categorized Transactions</h3>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${s.badge}`}>
                  {filteredTransactions.length} records
                </span>
              </div>

              {/* Tier Filters & Search Bar */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className={`w-full sm:w-44 text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800' 
                        : 'bg-zinc-800/60 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>

                {/* Tier Buttons */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg border border-black/5 dark:border-white/10 text-[11px]">
                  <button
                    onClick={() => setActiveTierFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeTierFilter === 'all'
                        ? isLight ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-white/15 text-white font-bold'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTierFilter('tier1')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      activeTierFilter === 'tier1'
                        ? isLight ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-white/15 text-white font-bold'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Tier 1 (Regex)
                  </button>
                  <button
                    onClick={() => setActiveTierFilter('tier2')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      activeTierFilter === 'tier2'
                        ? isLight ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-white/15 text-white font-bold'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Tier 2 (Pattern)
                  </button>
                  <button
                    onClick={() => setActiveTierFilter('tier3')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      activeTierFilter === 'tier3'
                        ? isLight ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-white/15 text-white font-bold'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Tier 3 (LLM)
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`text-[11px] uppercase tracking-wider font-mono ${s.tableHeader}`}>
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Merchant / Origin</th>
                    <th className="px-6 py-3.5 font-medium">AI Category</th>
                    <th className="px-6 py-3.5 font-medium text-right">Amount</th>
                    <th className="px-6 py-3.5 font-medium text-center">AI Tier</th>
                    <th className="px-6 py-3.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTxn(tx)}
                      className={`group transition-colors cursor-pointer ${s.tableRow}`}
                    >
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/5 text-zinc-200'}`}>
                            {tx.merchant[0]}
                          </div>
                          <div>
                            <div className="font-medium text-sm leading-snug">{tx.merchant}</div>
                            <div className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'} truncate max-w-xs mt-0.5`}>
                              {tx.account} • {tx.date}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'}`}>
                          {tx.category}
                        </span>
                      </td>

                      <td className={`px-6 py-4 text-right font-mono font-medium ${
                        privacyMode ? 'filter blur-md select-none transition-all' : ''
                      } ${tx.amount.startsWith('+') ? 'text-emerald-500' : isLight ? 'text-slate-900' : 'text-white'}`}>
                        {tx.amount}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            tx.tier === 'Tier 3' 
                              ? s.badge 
                              : tx.tier === 'Tier 2'
                                ? isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-zinc-800/80 text-zinc-400 border-white/5'
                          }`}>
                            {tx.tier}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider mt-1 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            {tx.tierLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`text-xs opacity-40 group-hover:opacity-100 transition-opacity font-mono flex items-center justify-end gap-1 ${s.accent}`}>
                          <span>Inspect</span>
                          <ArrowUpRight size={13} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS BAR */}
        <footer className={`mt-10 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'} font-mono`}>
          <div className="flex items-center gap-3">
            <span>LOCAL ENGINE: GEMINI-2.0-FLASH-NATIVE</span>
            <span>•</span>
            <span>ENCLAVE: ZERO_PERSISTENCE</span>
          </div>
          <div>
            <span>SYSTEM HEALTH: 100% OPERATIONAL</span>
          </div>
        </footer>

      </main>

      {/* ======================================================== */}
      {/* DECISION INSPECTOR MODAL                                 */}
      {/* ======================================================== */}
      <DecisionInspectorModal
        txn={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onSaveRule={handleSaveRule}
        s={s}
      />

      {/* ======================================================== */}
      {/* STATEMENT UPLOAD MODAL                                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl border ${s.card} p-6 sm:p-8 shadow-2xl relative`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Upload size={18} className={s.accent} />
                  <h3 className="font-semibold text-lg">Upload Bank Statement</h3>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'} mb-6`}>
                Simulate ingestion of PDF/CSV statement. Our tiered AI engine categorizes all rows locally.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleTransactionsAdded('HDFC Bank')}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">HDFC Bank Salary Statement (PDF)</div>
                    <div className="text-[11px] opacity-60">142 rows • NEFT salary & utility bills</div>
                  </div>
                  <span className={`text-xs font-mono ${s.accent}`}>Simulate ➔</span>
                </button>

                <button
                  onClick={() => handleTransactionsAdded('ICICI Bank')}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isLight ? 'hover:bg-slate-50 border-slate-200' : 'hover:bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">ICICI Credit Card Statement (CSV)</div>
                    <div className="text-[11px] opacity-60">84 rows • Travel, dining & subscriptions</div>
                  </div>
                  <span className={`text-xs font-mono ${s.accent}`}>Simulate ➔</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// SUB-COMPONENTS
const NavItem = ({ icon, label, active = false, onClick, isLight, s }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
      active 
        ? isLight
          ? 'bg-slate-200 text-slate-900 font-semibold'
          : 'bg-white/10 text-white font-semibold'
        : isLight
          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} 
    <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, change, trend, subtext, privacy, s, isLight }) => (
  <div className={`p-6 rounded-2xl border ${s.card} shadow-sm flex flex-col justify-between`}>
    <div>
      <p className={`text-[11px] font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-zinc-400'} mb-2`}>
        {label}
      </p>
      <div className="flex items-end justify-between">
        <h4 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${s.mono} ${
          privacy ? 'filter blur-md select-none transition-all' : ''
        }`}>
          {value}
        </h4>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
          trend === 'optimal'
            ? 'text-blue-400 bg-blue-500/10'
            : trend === 'up'
              ? 'text-emerald-500 bg-emerald-500/10'
              : 'text-amber-500 bg-amber-500/10'
        }`}>
          {change}
        </span>
      </div>
    </div>
    {subtext && (
      <div className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'} mt-3 pt-3 border-t border-black/5 dark:border-white/5 font-sans`}>
        {subtext}
      </div>
    )}
  </div>
);
