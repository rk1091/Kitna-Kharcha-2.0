import React, { useState, useRef, useEffect } from 'react';
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
  Snowflake,
  Flame,
  Star,
  Coffee,
  Check,
  ArrowUpRight,
  Lock,
  Layers,
  Activity
} from 'lucide-react';

const App = () => {
  const [theme, setTheme] = useState('midnight');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef(null);

  // Close palette if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setIsPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeStyles = {
    // 1. MIDNIGHT NAVY (Professional Dark)
    midnight: {
      name: 'Midnight Navy',
      tagline: 'Deep Slate & Electric Cobalt',
      bg: 'bg-[#0F172A]',
      card: 'bg-[#1E293B]/60 backdrop-blur-xl border-slate-700/80 shadow-[0_8px_30px_rgb(15,23,42,0.4)]',
      cardHover: 'hover:border-blue-500/50',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      accent: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
      buttonAlt: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
      font: 'font-outfit',
      heading: 'font-outfit font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Moon className="text-blue-400" size={18} />,
      dotColor: '#3b82f6'
    },
    // 2. STARRY NIGHT (Deep Indigo & Gold)
    starry: {
      name: 'Starry Night',
      tagline: 'Cosmic Indigo, Nebula Glow & Stardust',
      bg: 'bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black',
      card: 'bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_30px_rgb(49,46,129,0.3)]',
      cardHover: 'hover:border-indigo-400/50',
      text: 'text-indigo-50',
      textMuted: 'text-indigo-200/60',
      accent: 'text-yellow-400',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]',
      buttonAlt: 'bg-indigo-500/20 text-yellow-300 border border-yellow-400/30',
      font: 'font-space',
      heading: 'font-space font-bold tracking-tight',
      mono: 'font-space font-semibold',
      icon: <Star className="text-yellow-400" size={18} />,
      dotColor: '#fbbf24'
    },
    // 3. COZY HEARTH (Christmas / Maroon)
    cozy: {
      name: 'Cozy Hearth',
      tagline: 'Warmth, holiday spirit & mindful living',
      bg: 'bg-[#F5F2ED]',
      card: 'bg-white/80 backdrop-blur-md border-[#D9CEB2] shadow-[0_8px_30px_rgb(217,206,178,0.3)]',
      cardHover: 'hover:border-[#800000]/40',
      text: 'text-[#2D241E]',
      textMuted: 'text-[#6B5E55]',
      accent: 'text-[#800000]',
      button: 'bg-[#800000] hover:bg-[#680000] text-white shadow-lg shadow-[#800000]/25',
      buttonAlt: 'bg-[#800000]/10 text-[#800000] border border-[#800000]/20',
      font: 'font-outfit',
      heading: 'font-playfair italic',
      mono: 'font-outfit font-semibold',
      icon: <Gift className="text-[#800000]" size={18} />,
      dotColor: '#800000'
    },
    // 4. NEKO KAWAII (Pastel Cats)
    cat: {
      name: 'Neko Kawaii',
      tagline: 'Cute, pastel lavender & paw-sitive vibes',
      bg: 'bg-[#F0E6FF]',
      card: 'bg-white/90 backdrop-blur-xl border-[#D1BBFF] shadow-[0_8px_30px_rgb(209,187,255,0.4)]',
      cardHover: 'hover:border-[#6B46C1]/50',
      text: 'text-[#4A376E]',
      textMuted: 'text-[#7A63A5]',
      accent: 'text-[#6B46C1]',
      button: 'bg-[#6B46C1] hover:bg-[#5835A8] text-white shadow-lg shadow-[#6B46C1]/30',
      buttonAlt: 'bg-[#6B46C1]/10 text-[#6B46C1] border border-[#6B46C1]/25',
      font: 'font-quicksand',
      heading: 'font-quicksand font-bold',
      mono: 'font-quicksand font-bold',
      icon: <Cat className="text-[#6B46C1]" size={18} />,
      dotColor: '#6B46C1'
    },
    // 5. STEALTH (OG Black & Green)
    stealth: {
      name: 'Stealth Matrix',
      tagline: 'Zero-trace terminal & cyber vault',
      bg: 'bg-[#050505]',
      card: 'bg-black/90 backdrop-blur-md border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.8)]',
      cardHover: 'hover:border-[#00FF94]/50',
      text: 'text-zinc-300',
      textMuted: 'text-zinc-500',
      accent: 'text-[#00FF94]',
      button: 'bg-[#00FF94] hover:bg-[#00dd80] text-black font-bold shadow-lg shadow-[#00FF94]/25',
      buttonAlt: 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/30',
      font: 'font-mono',
      heading: 'font-mono font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Zap className="text-[#00FF94]" size={18} />,
      dotColor: '#00FF94'
    },
    // 6. SOLAR (High-Energy Growth)
    solar: {
      name: 'Solar Energy',
      tagline: 'Warm optimism & AI acceleration',
      bg: 'bg-[#FDFCFB]',
      card: 'bg-white border-orange-100 shadow-[0_8px_30px_rgb(249,115,22,0.08)]',
      cardHover: 'hover:border-orange-300',
      text: 'text-slate-800',
      textMuted: 'text-stone-500',
      accent: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25',
      buttonAlt: 'bg-orange-50 text-orange-700 border border-orange-200',
      font: 'font-inter',
      heading: 'font-inter font-bold tracking-tight',
      mono: 'font-mono',
      icon: <Flame className="text-orange-600" size={18} />,
      dotColor: '#ea580c'
    },
    // 7. NORDIC FROST (Calm Minimalist)
    nordic: {
      name: 'Nordic Frost',
      tagline: 'Anxiety-reducing alpine calm',
      bg: 'bg-[#F8FAFC]',
      card: 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgb(2,132,199,0.06)]',
      cardHover: 'hover:border-sky-300',
      text: 'text-slate-700',
      textMuted: 'text-slate-400',
      accent: 'text-blue-500',
      button: 'bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-800/20',
      buttonAlt: 'bg-blue-50 text-blue-700 border border-blue-200',
      font: 'font-inter',
      heading: 'font-inter font-semibold tracking-tight',
      mono: 'font-mono',
      icon: <Snowflake className="text-blue-400" size={18} />,
      dotColor: '#0284c7'
    },
    // 8. PAPER (Modern Light Editorial)
    paper: {
      name: 'Modern Paper',
      tagline: 'Clean Swiss editorial minimalism',
      bg: 'bg-white',
      card: 'bg-[#F9F9F9] border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]',
      cardHover: 'hover:border-gray-400',
      text: 'text-black',
      textMuted: 'text-gray-500',
      accent: 'text-blue-600',
      button: 'bg-black hover:bg-gray-800 text-white shadow-md',
      buttonAlt: 'bg-gray-100 text-black border border-gray-300',
      font: 'font-inter',
      heading: 'font-inter font-extrabold tracking-tight',
      mono: 'font-mono',
      icon: <Sun className="text-gray-800" size={18} />,
      dotColor: '#18181b'
    }
  };

  const s = themeStyles[theme];

  const transactions = [
    {
      id: 1,
      name: 'Amazon Web Services',
      sub: 'Cloud Services',
      price: '-₹4,200',
      tier: 'T3: LLM Refined',
      isDebit: true
    },
    {
      id: 2,
      name: 'Apple Store India',
      sub: 'Hardware Workstation',
      price: '-₹1,89,000',
      tier: 'T3: LLM Refined',
      isDebit: true
    },
    {
      id: 3,
      name: 'Starbucks Reserve',
      sub: 'Lifestyle & Meeting',
      price: '-₹750',
      tier: 'T1: Regex Match',
      isDebit: true
    },
    {
      id: 4,
      name: 'Netflix Premium 4K',
      sub: 'Entertainment',
      price: '-₹499',
      tier: 'T2: Pattern Sync',
      isDebit: true
    }
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${s.bg} ${s.font} ${s.text} p-4 sm:p-6 md:p-10 relative overflow-x-hidden`}
    >
      {/* Dynamic Background Watermarks */}
      {theme === 'cat' && (
        <Cat
          className="fixed -right-20 -bottom-20 opacity-5 pointer-events-none text-[#6B46C1] rotate-12 transition-all duration-700"
          size={500}
        />
      )}
      {theme === 'starry' && (
        <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#ffffff_0.8px,transparent_1px)] [background-size:28px_28px]" />
      )}
      {theme === 'cozy' && (
        <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#800000_0.7px,transparent_1px)] [background-size:24px_24px]" />
      )}
      {theme === 'stealth' && (
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] [background-size:32px_32px]" />
      )}

      {/* --- HEADER --- */}
      <nav className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${s.button} shadow-lg transition-transform hover:scale-105`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl tracking-tight leading-tight ${s.heading} ${theme === 'stealth' ? 'text-white' : ''}`}>
                Kitna Kharcha <span className="opacity-40 text-sm font-sans font-semibold">2.0</span>
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.buttonAlt}`}>
                {s.name}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 font-sans mt-0.5">
              Privacy-First AI Financial Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* THEME DRAWER / PALETTE EXPANDER */}
          <div className="relative" ref={paletteRef}>
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${s.card} ${s.cardHover} transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm`}
            >
              <Palette size={18} className={s.accent} />
              <span className="text-xs font-bold tracking-wide">Themes ({Object.keys(themeStyles).length})</span>
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm ml-0.5"
                style={{ backgroundColor: s.dotColor }}
              />
            </button>

            {/* EXPANDABLE THEME DRAWER (2-COLUMN GRID) */}
            {isPaletteOpen && (
              <div
                className={`absolute right-0 mt-3 p-3.5 rounded-3xl border shadow-2xl z-50 grid grid-cols-2 gap-2.5 w-72 sm:w-80 ${s.card} animate-in fade-in zoom-in-95 duration-200`}
              >
                <div className="col-span-2 px-2 pb-1 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Master Color Schemes
                  </span>
                  <span className="text-[10px] opacity-40 font-mono">8 styles</span>
                </div>

                {Object.keys(themeStyles).map((t) => {
                  const item = themeStyles[t];
                  const isActive = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setIsPaletteOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all text-xs font-semibold ${
                        isActive
                          ? `${item.button} shadow-md`
                          : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="scale-90">{item.icon}</div>
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isActive && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PRIVACY BLUR TOGGLE */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`p-2.5 rounded-2xl border ${s.card} transition-all duration-300 flex items-center gap-2 ${
              privacyMode
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 ring-2 ring-rose-500/20'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
            }`}
            title="Toggle Privacy Blur across all numbers"
          >
            {privacyMode ? <EyeOff size={19} className="text-rose-500 animate-pulse" /> : <Eye size={19} />}
            <span className="text-xs font-bold hidden sm:inline">
              {privacyMode ? 'Vault Locked' : 'Privacy Mode'}
            </span>
          </button>
        </div>
      </nav>

      {/* --- BENTO DASHBOARD --- */}
      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        
        {/* 1. LARGE BALANCE HERO CARD */}
        <div
          className={`col-span-12 lg:col-span-8 ${s.card} ${s.cardHover} border p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group transition-all duration-300 flex flex-col justify-between`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 opacity-70">
                <Coffee size={16} className={s.accent} />
                <span className="text-xs font-bold uppercase tracking-widest">Available Net Liquidity</span>
              </div>
              <span className="text-xs opacity-50 font-mono hidden sm:inline">Updated 2m ago</span>
            </div>

            <div className="my-2">
              <h2
                className={`text-5xl sm:text-7xl font-bold tracking-tighter transition-all duration-500 cursor-pointer ${
                  s.mono
                } ${privacyMode ? 'filter blur-2xl hover:blur-none select-none' : ''} ${
                  theme === 'stealth' ? 'text-white' : ''
                }`}
                title={privacyMode ? 'Hover to peek' : ''}
              >
                ₹1,24,850<span className="text-2xl sm:text-4xl opacity-30">.00</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${s.buttonAlt} flex items-center gap-1.5`}>
                <Sparkles size={13} />
                AI Tier: LLM-Optimized
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                +12.5% vs Last Month
              </span>
            </div>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-current opacity-[0.03] rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </div>

        {/* 2. AI INSIGHT BENTO CARD */}
        <div
          className={`col-span-12 lg:col-span-4 ${s.button} p-8 rounded-[3rem] shadow-xl flex flex-col justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden`}
        >
          <div className="flex justify-between items-start">
            <Sparkles size={32} className="opacity-90 group-hover:rotate-12 transition-transform duration-300" />
            <div className="bg-white/20 dark:bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              Priority Alert
            </div>
          </div>

          <div className="my-6">
            <h3 className="text-2xl font-bold mb-3 leading-tight tracking-tight">
              "Midnight Splurge Detected"
            </h3>
            <p className="text-sm opacity-90 leading-relaxed font-sans">
              You've spent <strong className="underline underline-offset-2">₹8,000</strong> on Food Delivery between 11 PM and 2 AM this week. That's 2x your normal monthly average.
            </p>
          </div>

          <button
            onClick={() => alert("Scheduled: 11 PM App Lock & Spend Notification")}
            className="w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
          >
            <span>Activate 11 PM Spend Lock</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* 3. RECENT INTELLIGENCE FEED */}
        <div className={`col-span-12 lg:col-span-7 ${s.card} ${s.cardHover} border p-7 sm:p-8 rounded-[3rem] transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-xl font-bold tracking-tight ${theme === 'stealth' ? 'text-white' : ''}`}>
                Financial Intelligence Feed
              </h3>
              <p className="text-xs opacity-50 mt-0.5">Automated Multi-Tier Categorization</p>
            </div>
            <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest font-mono">
              Sorted by Confidence
            </div>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <TxRow
                key={tx.id}
                name={tx.name}
                sub={tx.sub}
                price={tx.price}
                tier={tx.tier}
                s={s}
                theme={theme}
                privacy={privacyMode}
              />
            ))}
          </div>
        </div>

        {/* 4. THEMATIC BOUTIQUE FEATURE CARD */}
        <div
          className={`col-span-12 lg:col-span-5 ${s.card} ${s.cardHover} border p-8 rounded-[3rem] flex flex-col items-center justify-center text-center overflow-hidden relative transition-all duration-300`}
        >
          {theme === 'cat' && <div className="text-6xl mb-4 animate-bounce">🐱</div>}
          {theme === 'starry' && <div className="text-6xl mb-4 animate-pulse">✨</div>}
          {theme === 'cozy' && <div className="text-6xl mb-4 animate-bounce-subtle">🎁</div>}
          {theme === 'stealth' && <div className="text-6xl mb-4 text-[#00FF94]">⚡</div>}
          {theme === 'solar' && <div className="text-6xl mb-4 text-orange-500">🔥</div>}
          {theme === 'nordic' && <div className="text-6xl mb-4 text-sky-400">❄️</div>}
          {theme === 'paper' && <div className="text-6xl mb-4 text-zinc-800">☀️</div>}
          {theme === 'midnight' && <div className="text-6xl mb-4 text-blue-400">🌙</div>}

          <h4 className={`text-lg font-bold mb-2 ${theme === 'stealth' ? 'text-white' : ''}`}>
            Kitna Kharcha Vault
          </h4>
          <p className="text-xs sm:text-sm opacity-70 max-w-[280px] leading-relaxed">
            Your bank statements are parsed on-device using local regular expressions and pattern sync. Zero telemetry leaves your system.
          </p>

          <div className="mt-5 py-1.5 px-5 rounded-full border border-dashed opacity-50 text-[11px] font-mono tracking-wider">
            ENCRYPTION: AES-256-GCM
          </div>
        </div>

      </main>
    </div>
  );
};

const TxRow = ({ name, sub, price, tier, s, theme, privacy }) => (
  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all group cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5">
    <div className="flex items-center gap-3.5">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs border ${s.card} group-hover:scale-105 transition-transform ${
          theme === 'stealth' ? 'bg-zinc-900 text-[#00FF94]' : 'bg-black/5 dark:bg-white/10'
        }`}
      >
        {name[0]}
      </div>
      <div>
        <div className={`font-bold tracking-tight text-sm ${theme === 'stealth' ? 'text-white' : ''}`}>
          {name}
        </div>
        <div className="text-[10px] font-bold uppercase opacity-50 tracking-wider">
          {sub} • <span className={s.accent}>{tier}</span>
        </div>
      </div>
    </div>
    <div
      className={`text-base sm:text-lg font-bold tracking-tight ${s.mono} ${
        privacy ? 'filter blur-lg hover:blur-none select-none transition-all' : ''
      } ${theme === 'stealth' ? 'text-[#00FF94]' : ''}`}
      title={privacy ? 'Hover to reveal' : ''}
    >
      {price}
    </div>
  </div>
);

export default App;
