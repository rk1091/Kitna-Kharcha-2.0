import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeOff,
  Eye,
  Sparkles,
  Cat,
  Gift,
  Zap,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Palette,
  Star,
  Flame,
  Snowflake,
  Activity,
  Trees,
  Heart,
  Check,
  Coffee,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers,
  SlidersHorizontal,
  Compass,
  Lock,
  Waves
} from 'lucide-react';
import Interactive3DBackground from './components/Interactive3DBackground.jsx';
import DecisionInspectorModal from './components/DecisionInspectorModal.jsx';
import StatementUploadCard from './components/StatementUploadCard.jsx';

export default function App() {
  const [theme, setTheme] = useState('cozy');
  const [backgroundMode, setBackgroundMode] = useState('3d-gyro'); // '3d-gyro' | '3d-matrix' | 'stars' | 'cats' | 'snow' | 'none'
  const [privacyMode, setPrivacyMode] = useState(false);
  const [maskPII, setMaskPII] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [activeTierFilter, setActiveTierFilter] = useState('all');
  const [insightApplied, setInsightApplied] = useState(false);

  // 14 LUXURY COLOR SCHEMES & TYPOGRAPHY
  const themeStyles = {
    // 1. COZY HEARTH (Warm Paper & Maroon)
    cozy: {
      id: 'cozy',
      name: 'Cozy Hearth',
      tagline: 'Warm Paper, Oxblood Maroon & Editorial Serif',
      bg: 'bg-[#F5F2ED]',
      card: 'bg-white/80 backdrop-blur-md border-[#D9CEB2] text-[#2D241E] shadow-[0_8px_30px_rgb(217,206,178,0.25)]',
      accent: 'text-[#800000]',
      badge: 'bg-[#800000]/10 text-[#800000] border-[#800000]/20',
      btn: 'bg-[#800000] hover:bg-[#6b0000] text-white shadow-lg shadow-[#800000]/25',
      font: 'font-playfair',
      heading: 'font-playfair italic font-bold',
      mono: 'font-outfit font-semibold',
      icon: <Gift size={16} className="text-[#800000]" />,
      dot: '#800000',
      defaultBg: 'snow'
    },

    // 2. STARRY NIGHT (Deep Cosmic Navy & Shooting Stars)
    starry: {
      id: 'starry',
      name: 'Starry Night 2.0',
      tagline: 'Deep Cosmic Navy & Shooting Stars',
      bg: 'bg-[#020617]',
      card: 'bg-white/5 backdrop-blur-xl border-white/10 text-indigo-50 shadow-[0_8px_30px_rgb(49,46,129,0.3)]',
      accent: 'text-yellow-400',
      badge: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
      font: 'font-space',
      heading: 'font-space font-bold tracking-tight',
      mono: 'font-space font-bold',
      icon: <Star size={16} className="text-yellow-400" />,
      dot: '#eab308',
      defaultBg: 'stars'
    },

    // 3. NEKO KAWAII 2.0 (Deep Mystic Purple & Floating Cats)
    neko: {
      id: 'neko',
      name: 'Neko Kawaii 2.0',
      tagline: 'Deep Mystic Purple & Floating Paws',
      bg: 'bg-[#2D1B4E]',
      card: 'bg-[#3B2667]/70 backdrop-blur-xl border-purple-400/20 text-pink-50 shadow-[0_8px_30px_rgb(91,33,182,0.35)]',
      accent: 'text-pink-300',
      badge: 'bg-pink-400/15 text-pink-300 border-pink-400/30',
      btn: 'bg-[#B794F4] hover:bg-[#a57ced] text-white shadow-lg shadow-purple-500/30',
      font: 'font-quicksand',
      heading: 'font-quicksand font-bold',
      mono: 'font-quicksand font-bold',
      icon: <Cat size={16} className="text-pink-300" />,
      dot: '#B794F4',
      defaultBg: 'cats'
    },

    // 4. NEKO PASTEL (Original Soft Lavender)
    nekoPastel: {
      id: 'nekoPastel',
      name: 'Neko Lavender',
      tagline: 'Pastel Lavender & Soft Cute Vibes',
      bg: 'bg-[#F0E6FF]',
      card: 'bg-white/85 backdrop-blur-xl border-[#D1BBFF] text-[#4A376E] shadow-[0_8px_30px_rgb(209,187,255,0.4)]',
      accent: 'text-[#6B46C1]',
      badge: 'bg-[#6B46C1]/10 text-[#6B46C1] border-[#6B46C1]/20',
      btn: 'bg-[#6B46C1] hover:bg-[#5835A8] text-white shadow-md shadow-[#6B46C1]/20',
      font: 'font-quicksand',
      heading: 'font-quicksand font-bold',
      mono: 'font-quicksand font-bold',
      icon: <Heart size={16} className="text-[#6B46C1]" />,
      dot: '#6B46C1',
      defaultBg: 'cats'
    },

    // 5. CHRISTMAS MORNING (Deep Festive Red with Falling Snow)
    christmas: {
      id: 'christmas',
      name: 'Christmas Morning',
      tagline: 'Deep Festive Red & Falling Snowflakes',
      bg: 'bg-[#451010]',
      card: 'bg-white/10 backdrop-blur-md border-red-300/20 text-red-50 shadow-[0_8px_30px_rgb(127,29,29,0.35)]',
      accent: 'text-yellow-300',
      badge: 'bg-yellow-300/15 text-yellow-200 border-yellow-300/30',
      btn: 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-950/40',
      font: 'font-playfair',
      heading: 'font-playfair italic font-bold',
      mono: 'font-outfit font-semibold',
      icon: <Snowflake size={16} className="text-yellow-300" />,
      dot: '#dc2626',
      defaultBg: 'snow'
    },

    // 6. MIDNIGHT NAVY (Professional Slate Dark)
    midnight: {
      id: 'midnight',
      name: 'Midnight Navy',
      tagline: 'Slate Obsidian & Electric Cobalt Glow',
      bg: 'bg-[#0F172A]',
      card: 'bg-[#1E293B]/70 backdrop-blur-xl border-slate-700/80 text-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.4)]',
      accent: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
      font: 'font-outfit',
      heading: 'font-outfit font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Moon size={16} className="text-blue-400" />,
      dot: '#3b82f6',
      defaultBg: '3d-gyro'
    },

    // 7. OG STEALTH MATRIX (Pitch Black & Neon Green)
    stealth: {
      id: 'stealth',
      name: 'OG Stealth Matrix',
      tagline: 'Pure Black Terminal & Cyber Neon',
      bg: 'bg-black',
      card: 'bg-zinc-950/80 backdrop-blur-md border-zinc-800 text-zinc-300 shadow-[0_8px_30px_rgb(0,0,0,0.8)]',
      accent: 'text-[#00FF94]',
      badge: 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30',
      btn: 'bg-[#00FF94] hover:bg-[#00dd80] text-black font-mono font-bold shadow-lg shadow-[#00FF94]/25',
      font: 'font-mono',
      heading: 'font-mono font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Zap size={16} className="text-[#00FF94]" />,
      dot: '#00FF94',
      defaultBg: '3d-matrix'
    },

    // 8. MIDNIGHT CYBER (Rich Black & Neon Purple)
    cyberPurple: {
      id: 'cyberPurple',
      name: 'Midnight Cyber',
      tagline: 'Deep Obsidian Vault & Neon Violet Glow',
      bg: 'bg-[#090a0f]',
      card: 'bg-[#12131d]/80 backdrop-blur-md border-white/10 text-zinc-100 shadow-[0_8px_30px_rgb(168,85,247,0.15)]',
      accent: 'text-[#a855f7]',
      badge: 'bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30',
      btn: 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-lg shadow-purple-500/25',
      font: 'font-inter',
      heading: 'font-inter font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Sparkles size={16} className="text-[#a855f7]" />,
      dot: '#a855f7',
      defaultBg: '3d-gyro'
    },

    // 9. CYBERPUNK 2077 (Neon Gold & Cyber Amber)
    cyberpunk: {
      id: 'cyberpunk',
      name: 'Cyberpunk Amber',
      tagline: 'High-Contrast Cyber Gold & Terminal Mesh',
      bg: 'bg-[#09090b]',
      card: 'bg-[#18181b]/80 backdrop-blur-md border-amber-500/20 text-amber-50 shadow-[0_8px_30px_rgb(245,158,11,0.15)]',
      accent: 'text-amber-400',
      badge: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      btn: 'bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold shadow-lg shadow-amber-500/25',
      font: 'font-mono',
      heading: 'font-mono font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Zap size={16} className="text-amber-400" />,
      dot: '#f59e0b',
      defaultBg: '3d-matrix'
    },

    // 10. DEEP OCEAN TRENCH (Abyssal Blue & Bioluminescent Aqua)
    ocean: {
      id: 'ocean',
      name: 'Ocean Trench',
      tagline: 'Deep Abyssal Marine & Bioluminescent Cyan',
      bg: 'bg-[#030712]',
      card: 'bg-[#0b1329]/80 backdrop-blur-md border-cyan-500/20 text-cyan-50 shadow-[0_8px_30px_rgb(6,182,212,0.18)]',
      accent: 'text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      btn: 'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/25',
      font: 'font-space',
      heading: 'font-space font-bold tracking-tight',
      mono: 'font-space font-bold',
      icon: <Waves size={16} className="text-cyan-400" />,
      dot: '#06b6d4',
      defaultBg: '3d-gyro'
    },

    // 11. ECO WEALTH (Deep Emerald & Gold)
    eco: {
      id: 'eco',
      name: 'Eco Wealth',
      tagline: 'Emerald Forest, Sustainable Prosperity & Gold',
      bg: 'bg-[#071911]',
      card: 'bg-[#0e291e]/80 backdrop-blur-md border-emerald-500/20 text-emerald-50 shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
      accent: 'text-[#fbbf24]',
      badge: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
      btn: 'bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/25',
      font: 'font-outfit',
      heading: 'font-outfit font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Trees size={16} className="text-[#10b981]" />,
      dot: '#10b981',
      defaultBg: '3d-gyro'
    },

    // 12. OG SOLAR (Warm Off-White & Electric Orange)
    solar: {
      id: 'solar',
      name: 'OG Solar Growth',
      tagline: 'Warm Sunlight, Electric Orange & Momentum',
      bg: 'bg-[#FFF9F5]',
      card: 'bg-white border-orange-100 text-slate-800 shadow-[0_8px_30px_rgb(249,115,22,0.08)]',
      accent: 'text-orange-600',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      btn: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25',
      font: 'font-outfit',
      heading: 'font-outfit font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Flame size={16} className="text-orange-600" />,
      dot: '#ea580c',
      defaultBg: '3d-gyro'
    },

    // 13. OG NORDIC (Alpine Frost Minimal)
    nordic: {
      id: 'nordic',
      name: 'OG Nordic Frost',
      tagline: 'Ice Blue Minimalist Ledger & Calm Focus',
      bg: 'bg-[#F8FAFC]',
      card: 'bg-white border-blue-50 text-slate-700 shadow-[0_8px_30px_rgb(2,132,199,0.06)]',
      accent: 'text-blue-500',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      btn: 'bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-800/20',
      font: 'font-inter',
      heading: 'font-inter font-semibold tracking-tight',
      mono: 'font-mono',
      icon: <Snowflake size={16} className="text-blue-400" />,
      dot: '#0284c7',
      defaultBg: 'snow'
    },

    // 14. MODERN PAPER (Clean Swiss Monochrome)
    paper: {
      id: 'paper',
      name: 'Modern Paper',
      tagline: 'Clean Swiss Editorial Monochrome',
      bg: 'bg-white',
      card: 'bg-[#F9F9F9] border-gray-200 text-black shadow-[0_4px_20px_rgb(0,0,0,0.03)]',
      accent: 'text-blue-600',
      badge: 'bg-gray-100 text-black border-gray-300',
      btn: 'bg-black hover:bg-zinc-800 text-white shadow-md',
      font: 'font-inter',
      heading: 'font-inter font-extrabold tracking-tight',
      mono: 'font-mono',
      icon: <Sun size={16} className="text-zinc-800" />,
      dot: '#18181b',
      defaultBg: 'none'
    }
  };

  const s = themeStyles[theme] || themeStyles.cozy;

  // INITIAL TRANSACTIONS DATA WITH TIER DETAILS
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1',
      name: 'Uber Premium Bangalore',
      rawDescription: ': WWW UBER COM IN BENGALURU C',
      category: 'Travel & Mobility',
      price: '₹420.00',
      tier: 'Tier 1: Substring Match',
      tierNum: 1,
      confidence: '100%',
      date: 'Today, 4:12 PM',
      account: 'HDFC •••• 4892',
      reasoning: 'Normalized from gateway wrapper (: WWW UBER COM IN) to canonical merchant "Uber". 0ms latency, 0 tokens.',
      maskedPII: 'UBER••••••••'
    },
    {
      id: 'tx-2',
      name: 'Amazon India Retail',
      rawDescription: 'AMZN PRIME VIDEO IN VIA SMARTBUY C',
      category: 'Entertainment',
      price: '₹2,100.00',
      tier: 'Tier 3: LLM Refined',
      tierNum: 3,
      confidence: '98.5%',
      date: 'Yesterday, 8:40 PM',
      account: 'SBI •••• 1044',
      reasoning: 'Disambiguated Amazon retail vs Prime video annual pass via batched Gemini Structured Classifier. 18 tokens.',
      maskedPII: 'AMZN PRIME••••••••'
    },
    {
      id: 'tx-3',
      name: 'Swiggy Gourmet Bangalore',
      rawDescription: ': RAZ*SwiggyBangalore C',
      category: 'Food & Dining',
      price: '₹650.00',
      tier: 'Tier 1: Substring Match',
      tierNum: 1,
      confidence: '100%',
      date: '23 Sep, 1:15 PM',
      account: 'HDFC •••• 4892',
      reasoning: 'Stripped gateway prefix (RAZ*) and matched "swiggy" substring rule directly. 0ms latency, 0 tokens.',
      maskedPII: 'RAZ*SWIGGY••••••••'
    },
    {
      id: 'tx-4',
      name: 'Netflix Premium 4K',
      rawDescription: 'NETFLIX ENTERTAINMENT SVCS MUMBAI',
      category: 'Entertainment',
      price: '₹499.00',
      tier: 'Tier 2: Pattern Sync',
      tierNum: 2,
      confidence: '95.0%',
      date: '22 Sep, 6:00 PM',
      account: 'ICICI •••• 9921',
      reasoning: 'Recognized recurring subscription pattern and digital entertainment merchant category code (MCC 4899). 12ms latency.',
      maskedPII: 'NETFLIX••••••••'
    },
    {
      id: 'tx-5',
      name: 'Indraprastha Gas Limited',
      rawDescription: 'IGL*INDRAPRASTHA GAS LTD NEW DELHI',
      category: 'Utilities & Bills',
      price: '₹820.00',
      tier: 'Tier 2: Pattern Sync',
      tierNum: 2,
      confidence: '94.0%',
      date: '21 Sep, 11:10 AM',
      account: 'HDFC •••• 4892',
      reasoning: 'Matched utility recurring payment pattern and utility biller registry.',
      maskedPII: 'IGL*••••••••'
    }
  ]);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTierFilter === 'all') return true;
    if (activeTierFilter === 'tier1') return tx.tierNum === 1;
    if (activeTierFilter === 'tier2') return tx.tierNum === 2;
    if (activeTierFilter === 'tier3') return tx.tierNum === 3;
    return true;
  });

  const handleTransactionsAdded = (bankName) => {
    const newTxns = [
      {
        id: `tx-${Date.now()}-1`,
        name: `${bankName} Salary Credit`,
        rawDescription: `NEFT CR ${bankName.toUpperCase()} CORP PAYROLL`,
        category: 'Income',
        price: '₹95,000.00',
        tier: 'Tier 1: Substring Match',
        tierNum: 1,
        confidence: '100%',
        date: 'Just Now',
        account: 'HDFC •••• 4892',
        reasoning: 'Identified corporate salary NEFT credit pattern with 0 tokens.',
        maskedPII: 'PAYROLL••••••••'
      },
      {
        id: `tx-${Date.now()}-2`,
        name: 'Zepto Instant Groceries',
        rawDescription: ': RAZ*ZeptoQuickMkt C',
        category: 'Groceries',
        price: '₹340.00',
        tier: 'Tier 1: Substring Match',
        tierNum: 1,
        confidence: '100%',
        date: 'Just Now',
        account: 'HDFC •••• 4892',
        reasoning: 'Matched "zepto" substring keyword directly.',
        maskedPII: 'ZEPTO••••••••'
      }
    ];
    setTransactions((prev) => [...newTxns, ...prev]);
  };

  const handleSaveRule = (txn) => {
    alert(`Created rule in DB: Always map "${txn.name}" to category "${txn.category}" via case-insensitive substring!`);
  };

  return (
    <div className={`relative min-h-screen transition-all duration-700 ${s.bg} ${s.font} ${s.card.includes('text-') ? '' : 'text-slate-800'} overflow-hidden`}>
      
      {/* ======================================================== */}
      {/* 3D INTERACTIVE BACKGROUND ENGINE                         */}
      {/* ======================================================== */}
      <Interactive3DBackground mode={backgroundMode} theme={theme} />

      {/* TOP SECURITY & METRICS BAR */}
      <div className="relative z-30 border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 bg-black/5 dark:bg-white/[0.02] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">Privacy Vault: 100% On-Device Active</span>
          <span className="opacity-40">•</span>
          <span className="opacity-70 font-mono">Zero Cloud Egress • AES-256 GCM</span>
        </div>

        {/* 3D Scene Mode Selector Floating Bar */}
        <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 p-1 rounded-full text-[11px] font-bold">
          <span className="opacity-50 px-2 flex items-center gap-1 uppercase tracking-wider text-[9px]">
            <Compass size={11} /> 3D Scene
          </span>
          {[
            { id: '3d-gyro', label: '3D Gyro' },
            { id: '3d-matrix', label: 'Matrix' },
            { id: 'stars', label: 'Stars' },
            { id: 'cats', label: 'Cats' },
            { id: 'snow', label: 'Snow' },
            { id: 'none', label: 'Flat' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setBackgroundMode(mode.id)}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                backgroundMode === mode.id
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                  : 'opacity-50 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* HEADER NAV                                               */}
      {/* ======================================================== */}
      <nav className="relative z-40 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${s.btn} shadow-xl transition-transform hover:scale-105`}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.heading}`}>
                Kitna Kharcha <span className="opacity-40 text-sm font-sans font-semibold">2.0</span>
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${s.badge} font-sans`}>
                {s.name}
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1.5 font-sans mt-0.5">
              <Activity size={10} className="text-emerald-400" />
              <span>{s.tagline}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* EXPANDABLE MASTER PALETTE DRAWER (14 THEMES) */}
          <div className="relative">
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`p-3 sm:px-4 rounded-2xl ${s.card} border flex items-center gap-2 hover:scale-105 transition-all shadow-sm text-xs font-bold uppercase tracking-wider`}
            >
              <Palette size={18} className={s.accent} />
              <span className="hidden sm:inline">Skins ({Object.keys(themeStyles).length})</span>
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm ml-0.5"
                style={{ backgroundColor: s.dot }}
              />
            </button>

            {/* FLOATING 2-COLUMN SKIN PICKER */}
            <AnimatePresence>
              {isPaletteOpen && (
                <motion.div
                  initial={{ y: 10, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 10, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={`absolute right-0 mt-3 p-3.5 rounded-3xl border shadow-2xl z-[100] w-72 sm:w-80 ${s.card} max-h-[75vh] overflow-y-auto`}
                >
                  <div className="px-2 pb-2 mb-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50 font-sans">
                    <span>Master Luxury Palette</span>
                    <span>14 Themes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {Object.keys(themeStyles).map((t) => {
                      const item = themeStyles[t];
                      const isActive = theme === t;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setTheme(t);
                            if (item.defaultBg) setBackgroundMode(item.defaultBg);
                            setIsPaletteOpen(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all text-left text-xs font-semibold ${
                            isActive
                              ? `${item.btn} shadow-md`
                              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.dot }} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          {isActive && <Check size={13} className="shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PRIVACY TOGGLE BUTTON */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`p-3 rounded-2xl ${s.card} border transition-all ${
              privacyMode ? 'bg-red-500/15 text-red-500 border-red-500/30 ring-2 ring-red-500/20' : 'hover:scale-105'
            }`}
            title="Toggle Privacy Blur across all numbers"
          >
            {privacyMode ? <EyeOff size={18} className="text-red-500" /> : <Eye size={18} />}
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* DASHBOARD BENTO GRID MAIN CONTENT                        */}
      {/* ======================================================== */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
        
        {/* 1. TOTAL CASH LIQUIDITY CARD */}
        <div className={`col-span-12 md:col-span-8 p-8 sm:p-12 md:p-14 rounded-[3rem] border ${s.card} shadow-2xl relative overflow-hidden group transition-all duration-300 flex flex-col justify-between`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-widest opacity-50 font-sans">
                Total Net Liquidity
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.badge} font-mono`}>
                ✨ AI Confidence: 99.8%
              </span>
            </div>

            <div
              className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter transition-all duration-700 cursor-pointer ${s.mono} ${
                privacyMode ? 'filter blur-2xl opacity-10 select-none' : ''
              }`}
              title={privacyMode ? 'Hover to reveal' : ''}
            >
              ₹3,42,000<span className="text-3xl md:text-5xl opacity-20">.00</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${s.badge} font-sans`}>
                Tier 1-3 AI Synced
              </span>
              <span className="text-xs opacity-50 font-sans">
                Next salary cycle in 5 days (HDFC Bank)
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-current opacity-[0.03] blur-3xl -mr-20 -mt-20 pointer-events-none" />
        </div>

        {/* 2. AI GENIUS COPILOT BLOCK */}
        <div className={`col-span-12 md:col-span-4 ${s.btn} rounded-[3rem] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <Sparkles size={40} className="opacity-80 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20">
              Copilot Signal
            </span>
          </div>

          <div className="my-6">
            <h4 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
              "You have ₹4,200 in recurring subscriptions you haven't used in 90 days."
            </h4>
            <p className="text-xs opacity-75 font-sans uppercase tracking-widest">
              AI Logic Refined • Yesterday
            </p>
          </div>

          <button
            onClick={() => {
              setInsightApplied(true);
              alert("Activated Wealth Strategy: 3 dormant recurring mandates scheduled for cancellation.");
            }}
            className="w-full bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <span>{insightApplied ? 'Strategy Active ✓' : 'Optimize My Wealth'}</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* 3. STATEMENT UPLOAD & OCR INGESTION CARD */}
        <StatementUploadCard s={s} onTransactionsAdded={handleTransactionsAdded} />

        {/* 4. TIERED ENGINE PIPELINE TELEMETRY CARD */}
        <div className={`col-span-12 lg:col-span-7 rounded-[3rem] border ${s.card} p-7 sm:p-9 flex flex-col justify-between shadow-sm transition-all duration-300`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu size={18} className={s.accent} />
                <h4 className="font-bold text-base">Tiered AI Pipeline Distribution</h4>
              </div>
              <span className="text-xs opacity-50 font-mono">0 Tokens on 86% Txns</span>
            </div>

            <p className="text-xs opacity-60 font-sans mb-5 leading-relaxed">
              Kitna Kharcha 2.0 uses a tiered cascade to eliminate token cost and rate limits while preserving high-precision taxonomy.
            </p>

            {/* Distribution Bar */}
            <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex gap-0.5 mb-4">
              <div className="h-full bg-emerald-400 w-[62%]" title="Tier 1 (Regex): 62%" />
              <div className="h-full bg-cyan-400 w-[24%]" title="Tier 2 (Pattern): 24%" />
              <div className="h-full bg-purple-400 w-[14%]" title="Tier 3 (LLM): 14%" />
            </div>

            {/* Breakdown Legend */}
            <div className="grid grid-cols-3 gap-2 text-xs font-sans">
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-emerald-400 block font-mono">TIER 1 (62%)</span>
                <span className="font-bold">Regex Substring</span>
                <p className="text-[10px] opacity-50 mt-0.5">0ms • 0 Tokens</p>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-cyan-400 block font-mono">TIER 2 (24%)</span>
                <span className="font-bold">Pattern Sync</span>
                <p className="text-[10px] opacity-50 mt-0.5">12ms • Embeddings</p>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-purple-400 block font-mono">TIER 3 (14%)</span>
                <span className="font-bold">Gemini Flash</span>
                <p className="text-[10px] opacity-50 mt-0.5">Batched • 429 Retry</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. STATEMENT INTELLIGENCE TRANSACTION FEED */}
        <div className={`col-span-12 rounded-[3rem] border ${s.card} p-6 sm:p-10 shadow-sm transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.heading}`}>
                Statement Intelligence Feed
              </h4>
              <p className="text-xs opacity-50 font-sans mt-0.5">
                Click any row to inspect the Tiered Decision Logic & Token Cost
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTierFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  activeTierFilter === 'all' ? 'bg-white/20 text-white shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTierFilter('tier1')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  activeTierFilter === 'tier1' ? 'bg-white/20 text-white shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
              >
                Tier 1 (Regex)
              </button>
              <button
                onClick={() => setActiveTierFilter('tier2')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  activeTierFilter === 'tier2' ? 'bg-white/20 text-white shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
              >
                Tier 2 (Pattern)
              </button>
              <button
                onClick={() => setActiveTierFilter('tier3')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  activeTierFilter === 'tier3' ? 'bg-white/20 text-white shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
              >
                Tier 3 (LLM)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransactions.map((tx) => (
              <TxRow
                key={tx.id}
                tx={tx}
                privacy={privacyMode}
                s={s}
                onClick={() => setSelectedTxn(tx)}
              />
            ))}
          </div>
        </div>

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

    </div>
  );
}

// Transaction Row Component
const TxRow = ({ tx, privacy, s, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.015 }}
    onClick={onClick}
    className="flex justify-between items-center p-5 sm:p-6 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all border border-black/[0.04] dark:border-white/5 cursor-pointer group"
  >
    <div className="flex items-center gap-4 sm:gap-5">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl ${s.btn} bg-opacity-80 shrink-0 group-hover:scale-105 transition-transform`}>
        {tx.name[0]}
      </div>
      <div>
        <p className="font-bold text-base sm:text-lg leading-snug mb-0.5">{tx.name}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 font-sans">
          {tx.category} • <span className={s.accent}>{tx.tier}</span>
        </p>
      </div>
    </div>
    <div className="text-right">
      <p
        className={`text-xl sm:text-2xl font-black tracking-tight ${s.mono} ${
          privacy ? 'filter blur-2xl select-none hover:blur-none transition-all' : ''
        }`}
        title={privacy ? 'Hover to reveal' : ''}
      >
        -{tx.price}
      </p>
      <span className="text-[10px] font-mono opacity-40 uppercase">Inspect ↗</span>
    </div>
  </motion.div>
);
