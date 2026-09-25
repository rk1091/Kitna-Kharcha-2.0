import React, { useState } from 'react';
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
  TrendingDown,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowUpRight,
  Lock,
  Layers,
  Heart
} from 'lucide-react';

const App = () => {
  const [theme, setTheme] = useState('cozy'); // cozy, cat, stealth, paper
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // THEME CONFIGURATION
  const themeStyles = {
    cozy: {
      id: 'cozy',
      name: 'Cozy Hearth',
      tagline: 'Warmth, holiday spirit & mindful living',
      bg: 'bg-[#F5F2ED]', // Warm Beige
      text: 'text-[#2D2424]',
      card: 'bg-white/75 backdrop-blur-md border-[#E3D9C6] shadow-[0_8px_30px_rgb(217,206,178,0.25)]',
      cardHover: 'hover:border-[#800000]/30',
      accent: 'text-[#800000]', // Maroon
      button: 'bg-[#800000] text-[#FFF9F5] shadow-lg shadow-[#800000]/20',
      buttonHover: 'hover:bg-[#680000]',
      badge: 'bg-[#800000]/10 text-[#800000] border-[#800000]/20',
      font: 'font-outfit',
      heading: 'font-playfair italic',
      mono: 'font-mono',
      icon: <Gift className="text-[#800000]" size={18} />
    },
    cat: {
      id: 'cat',
      name: 'Neko Kawaii',
      tagline: 'Cute, pastel lavender & paw-sitive vibes',
      bg: 'bg-[#F3ECFF]', // Soft Lavender
      text: 'text-[#362557]',
      card: 'bg-white/85 backdrop-blur-xl border-[#DAC8FF] shadow-[0_8px_30px_rgb(209,187,255,0.3)]',
      cardHover: 'hover:border-[#6B46C1]/40',
      accent: 'text-[#6B46C1]',
      button: 'bg-[#6B46C1] text-white shadow-lg shadow-[#6B46C1]/25',
      buttonHover: 'hover:bg-[#5835A8]',
      badge: 'bg-[#6B46C1]/10 text-[#6B46C1] border-[#6B46C1]/25',
      font: 'font-quicksand',
      heading: 'font-quicksand font-bold',
      mono: 'font-quicksand font-semibold',
      icon: <Cat className="text-[#6B46C1]" size={18} />
    },
    stealth: {
      id: 'stealth',
      name: 'Midnight Stealth',
      tagline: 'Encrypted cypherpunk vault',
      bg: 'bg-[#050505]',
      text: 'text-zinc-200',
      card: 'bg-[#101012]/90 backdrop-blur-md border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.6)]',
      cardHover: 'hover:border-[#00FF94]/40',
      accent: 'text-[#00FF94]',
      button: 'bg-[#00FF94] text-black font-bold shadow-lg shadow-[#00FF94]/25',
      buttonHover: 'hover:bg-[#00dd80]',
      badge: 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30',
      font: 'font-mono',
      heading: 'font-mono font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Zap className="text-[#00FF94]" size={18} />
    },
    paper: {
      id: 'paper',
      name: 'Modern Paper',
      tagline: 'High-contrast editorial minimalism',
      bg: 'bg-[#F9FAFB]',
      text: 'text-zinc-900',
      card: 'bg-white border-zinc-200 shadow-[0_4px_20px_rgb(0,0,0,0.04)]',
      cardHover: 'hover:border-zinc-400',
      accent: 'text-blue-600',
      button: 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10',
      buttonHover: 'hover:bg-zinc-800',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      font: 'font-inter',
      heading: 'font-inter font-black tracking-tight',
      mono: 'font-mono',
      icon: <Sun className="text-zinc-800" size={18} />
    }
  };

  const s = themeStyles[theme];

  const transactions = [
    {
      id: 1,
      name: 'Apple Services',
      subtitle: 'iCloud+ 2TB & Apple One',
      cat: 'Subscriptions',
      price: '₹199.00',
      tier: 'Tier 1: Regex Match',
      tierShort: 'Tier 1',
      date: 'Today, 4:12 PM',
      isDebit: true
    },
    {
      id: 2,
      name: 'Zomato Limited',
      subtitle: 'Artisan Sourdough & Cold Brew',
      cat: 'Dining Out',
      price: '₹840.00',
      tier: 'Tier 3: LLM Refined',
      tierShort: 'Tier 3',
      date: 'Yesterday, 8:40 PM',
      isDebit: true
    },
    {
      id: 3,
      name: 'Shell Petrol Station',
      subtitle: 'V-Power High Octane Fuel',
      cat: 'Automotive',
      price: '₹3,200.00',
      tier: 'Tier 2: Pattern Sync',
      tierShort: 'Tier 2',
      date: '23 Sep, 11:15 AM',
      isDebit: true
    },
    {
      id: 4,
      name: 'Starbucks Coffee',
      subtitle: 'Caramel Macchiato x 2',
      cat: 'Cafes',
      price: '₹680.00',
      tier: 'Tier 1: Regex Match',
      tierShort: 'Tier 1',
      date: '22 Sep, 3:30 PM',
      isDebit: true
    },
    {
      id: 5,
      name: 'Client Retainer Payout',
      subtitle: 'Design Consulting (Wireframe Sync)',
      cat: 'Income',
      price: '₹65,000.00',
      tier: 'Tier 1: Direct Credit',
      tierShort: 'Credit',
      date: '20 Sep, 10:00 AM',
      isDebit: false
    }
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${s.bg} ${s.font} ${s.text} p-4 sm:p-6 md:p-10 relative overflow-x-hidden`}
    >
      {/* Dynamic Background Watermarks */}
      {theme === 'cat' && (
        <Cat
          className="fixed -right-16 -bottom-16 opacity-5 pointer-events-none text-[#6B46C1] rotate-12 transition-all duration-700"
          size={460}
        />
      )}
      {theme === 'cozy' && (
        <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#800000_0.75px,transparent_1px)] [background-size:24px_24px]" />
      )}
      {theme === 'stealth' && (
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] [background-size:32px_32px]" />
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl ${s.button} transition-transform duration-300 hover:scale-105`}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-3xl tracking-tight leading-tight ${s.heading} ${
                theme === 'stealth' ? 'text-white' : ''
              }`}
            >
              Kitna Kharcha <span className="opacity-40 text-sm font-sans font-semibold">2.0</span>
            </h1>
            <p className="text-xs opacity-60 font-sans tracking-wide">
              {s.tagline}
            </p>
          </div>
        </div>

        {/* Dynamic Boutique Theme Switcher & Privacy Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/60 dark:bg-zinc-900/60 p-1.5 sm:p-2 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-xl">
          <ThemeBtn
            label="Cozy"
            icon={<Gift size={18} />}
            active={theme === 'cozy'}
            onClick={() => setTheme('cozy')}
            color="bg-[#800000]"
          />
          <ThemeBtn
            label="Neko"
            icon={<Cat size={18} />}
            active={theme === 'cat'}
            onClick={() => setTheme('cat')}
            color="bg-[#6B46C1]"
          />
          <ThemeBtn
            label="Stealth"
            icon={<Moon size={18} />}
            active={theme === 'stealth'}
            onClick={() => setTheme('stealth')}
            color="bg-[#00FF94] !text-black"
          />
          <ThemeBtn
            label="Paper"
            icon={<Sun size={18} />}
            active={theme === 'paper'}
            onClick={() => setTheme('paper')}
            color="bg-zinc-900 text-white"
          />

          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {/* Privacy Toggle Button */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold ${
              privacyMode
                ? 'bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
            title="Toggle Privacy Blur for all sensitive financial figures"
          >
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="hidden sm:inline">
              {privacyMode ? 'Blurred' : 'Mask'}
            </span>
          </button>
        </div>
      </nav>

      {/* BENTO GRID MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-6 items-stretch">
        
        {/* 1. BIG HERO OUTFLOW STAT CARD */}
        <div
          className={`col-span-12 lg:col-span-8 ${s.card} ${s.cardHover} border p-7 sm:p-9 rounded-[2rem] relative overflow-hidden transition-all duration-300 flex flex-col justify-between`}
        >
          {theme === 'cat' && (
            <Cat
              className="absolute -right-6 -bottom-6 opacity-[0.06] rotate-12 pointer-events-none text-[#6B46C1]"
              size={240}
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase tracking-[0.2em] text-xs font-bold opacity-60">
                Total Monthly Outflow
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${s.badge} flex items-center gap-1 font-semibold`}
              >
                <Sparkles size={13} />
                September Active
              </span>
            </div>

            {/* Main Numeric Amount */}
            <div className="my-3">
              <h2
                className={`text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight transition-all duration-300 cursor-pointer ${
                  s.mono
                } ${privacyMode ? 'filter blur-xl hover:blur-none select-none' : ''} ${
                  theme === 'stealth' ? 'text-white' : ''
                }`}
                title={privacyMode ? 'Hover to reveal' : ''}
              >
                ₹84,200<span className="text-2xl sm:text-4xl opacity-50">.00</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <Sparkles size={14} /> AI Optimized: -14% vs Aug
            </span>
            <span className="text-xs opacity-60 flex items-center gap-1">
              <Clock size={14} /> Next major bill in 4 days (HDFC Credit Card)
            </span>
          </div>
        </div>

        {/* 2. AI INSIGHT BENTO CARD */}
        <div
          className={`col-span-12 lg:col-span-4 ${s.button} p-7 sm:p-9 rounded-[2rem] shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group`}
        >
          <div className="flex items-center justify-between">
            <Sparkles size={32} className="opacity-90 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 dark:bg-black/20">
              Copilot Signal
            </span>
          </div>

          <div className="my-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug">
              Your coffee habit is now a "Small Business"
            </h3>
            <p className="text-sm opacity-90 leading-relaxed font-sans">
              You've spent <strong className="underline underline-offset-2">₹4,500</strong> at Starbucks & Blue Tokai this month. That's a 15% increase from last month.
            </p>
          </div>

          <button
            onClick={() => alert("Activated: Weekly ₹1,000 Cafe Soft Limit strategy")}
            className="w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
          >
            <span>Set Weekly Cafe Cap</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* 3. RECENT INTELLIGENCE TRANSACTION LIST */}
        <div
          className={`col-span-12 lg:col-span-7 ${s.card} ${s.cardHover} border p-6 sm:p-8 rounded-[2rem] transition-all duration-300`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3
                className={`text-xl sm:text-2xl ${s.heading} ${
                  theme === 'stealth' ? 'text-white' : ''
                }`}
              >
                Recent Intelligence
              </h3>
              <p className="text-xs opacity-50 mt-0.5">
                Real-time classification via Tiered Engine
              </p>
            </div>
            <button
              onClick={() => alert("Viewing all 48 transactions")}
              className="text-xs uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-opacity"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <TxRow
                key={tx.id}
                name={tx.name}
                subtitle={tx.subtitle}
                cat={tx.cat}
                price={tx.price}
                tier={tx.tier}
                isDebit={tx.isDebit}
                privacy={privacyMode}
                theme={theme}
                s={s}
              />
            ))}
          </div>
        </div>

        {/* 4. THEMATIC BOUTIQUE MINI CARD */}
        <div
          className={`col-span-12 lg:col-span-5 ${s.card} ${s.cardHover} border p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300`}
        >
          {theme === 'cat' ? (
            <div className="py-4 space-y-4 max-w-xs animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-[#6B46C1]/15 text-[#6B46C1] rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner shadow-[#6B46C1]/20">
                🐱
              </div>
              <h4 className="text-lg font-bold text-[#6B46C1]">Neko Vault Status</h4>
              <p className="italic opacity-80 text-sm leading-relaxed font-quicksand">
                "Meow-ney well spent! Your savings are growing like a well-fed kitty."
              </p>
              <div className="pt-2 flex justify-center gap-1.5 text-xs text-[#6B46C1]">
                <Heart size={14} className="fill-[#6B46C1]" />
                <span className="font-semibold">Purr-fect Budgeting</span>
              </div>
            </div>
          ) : theme === 'cozy' ? (
            <div className="py-4 space-y-4 max-w-xs animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-[#800000]/15 text-[#800000] rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner shadow-[#800000]/20">
                🎄
              </div>
              <h4 className="text-lg font-bold text-[#800000] font-playfair italic">
                Cozy Hearth Wisdom
              </h4>
              <p className="italic opacity-80 text-sm leading-relaxed font-playfair">
                "Warmth is in the budget. You saved enough for a nice gift today."
              </p>
              <div className="pt-2 text-xs text-[#800000] font-semibold flex items-center justify-center gap-1">
                <span>Hot Cocoa Reserve:</span>
                <span className="font-bold underline">₹3,400</span>
              </div>
            </div>
          ) : theme === 'stealth' ? (
            <div className="py-4 space-y-4 max-w-xs animate-in fade-in zoom-in-95 duration-300 text-left w-full">
              <div className="flex items-center gap-2 text-[#00FF94] text-xs font-mono font-bold tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-ping" />
                <span>Zero-Trace Encryption</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1.5">
                <div className="text-zinc-500">// Vault Status</div>
                <div className="text-white">Local-First Storage: <span className="text-[#00FF94]">ACTIVE</span></div>
                <div className="text-white">Cloud Egress: <span className="text-[#00FF94]">0.00 KB</span></div>
                <div className="text-white">Hash: <span className="text-zinc-400">sha256:d89a...7c</span></div>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Hardware-level encryption active on all local SQLite statement records.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-4 max-w-xs animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-800">
                <Layers size={28} />
              </div>
              <h4 className="text-base font-bold text-zinc-900">Clean Editorial Ledger</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Balanced typography crafted for dense financial statements with zero visual clutter.
              </p>
              <div className="pt-1 text-[11px] text-zinc-400 font-mono">
                System Font: Inter + SF Mono
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

// UI COMPONENTS
const ThemeBtn = ({ label, icon, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs font-medium ${
      active
        ? `${color} shadow-md scale-105`
        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'
    }`}
    title={`Switch to ${label} Theme`}
  >
    {icon}
    <span className="hidden md:inline font-semibold">{label}</span>
  </button>
);

const TxRow = ({ name, subtitle, cat, price, tier, isDebit, privacy, theme, s }) => (
  <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5">
    <div className="flex items-center gap-3.5">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          theme === 'stealth'
            ? 'bg-zinc-800/80 text-[#00FF94] border border-white/10'
            : 'bg-black/5 dark:bg-white/10'
        }`}
      >
        {name[0]}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p
            className={`font-semibold text-sm ${
              theme === 'stealth' ? 'text-white' : ''
            }`}
          >
            {name}
          </p>
          <span className="text-[10px] opacity-50 hidden sm:inline">• {cat}</span>
        </div>
        <p className="text-xs opacity-50 font-sans mt-0.5">{tier}</p>
      </div>
    </div>

    <div className="text-right">
      <p
        className={`font-bold text-sm sm:text-base ${s.mono} ${
          privacy ? 'filter blur-md hover:blur-none select-none transition-all' : ''
        } ${!isDebit ? 'text-emerald-500' : theme === 'stealth' ? 'text-[#00FF94]' : ''}`}
        title={privacy ? 'Hover to reveal' : ''}
      >
        {isDebit ? `-${price}` : `+${price}`}
      </p>
      <span className="text-[10px] opacity-40 hidden sm:block">Verified</span>
    </div>
  </div>
);

export default App;
