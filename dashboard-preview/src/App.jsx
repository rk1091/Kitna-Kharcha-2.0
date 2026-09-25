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
  Wallet,
  Activity,
  Lock,
  Unlock,
  ArrowUpRight,
  Snowflake,
  Sliders,
  Check
} from 'lucide-react';
import LockScreen from './LockScreen.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('lock'); // 'lock' | 'dashboard'
  const [theme, setTheme] = useState('starry');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const themeStyles = {
    starry: {
      id: 'starry',
      name: 'Starry Night 2.0',
      tagline: 'Deep Cosmic Navy & Shooting Stars',
      bg: 'bg-[#020617]',
      card: 'bg-white/5 backdrop-blur-xl border-white/10 text-indigo-50 shadow-[0_8px_30px_rgb(49,46,129,0.3)]',
      cardHover: 'hover:border-indigo-400/50',
      accent: 'text-yellow-400',
      accentBadge: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25',
      font: 'font-space',
      heading: 'font-space font-bold',
      mono: 'font-space font-bold',
      specialBg: 'stars',
      dot: '#fbbf24'
    },
    neko: {
      id: 'neko',
      name: 'Neko Kawaii 2.0',
      tagline: 'Deep Mystic Purple & Floating Paws',
      bg: 'bg-[#24133f]', // Richer Deep Purple
      card: 'bg-[#351c5e]/70 backdrop-blur-xl border-purple-400/20 text-pink-50 shadow-[0_8px_30px_rgb(91,33,182,0.35)]',
      cardHover: 'hover:border-pink-300/40',
      accent: 'text-pink-300',
      accentBadge: 'bg-pink-400/10 text-pink-300 border-pink-400/30',
      btn: 'bg-[#9061d4] hover:bg-[#804ec9] text-white shadow-lg shadow-purple-500/30',
      font: 'font-quicksand',
      heading: 'font-quicksand font-bold',
      mono: 'font-quicksand font-bold',
      specialBg: 'cats',
      dot: '#e879f9'
    },
    cozy: {
      id: 'cozy',
      name: 'Christmas Morning',
      tagline: 'Warm Hearth, Deep Oxblood & Falling Snow',
      bg: 'bg-[#3b0d0d]', // Deep Festive Red
      card: 'bg-white/10 backdrop-blur-md border-red-300/20 text-red-50 shadow-[0_8px_30px_rgb(127,29,29,0.35)]',
      cardHover: 'hover:border-amber-300/40',
      accent: 'text-yellow-300',
      accentBadge: 'bg-yellow-300/10 text-yellow-200 border-yellow-300/30',
      btn: 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-950/50',
      font: 'font-playfair',
      heading: 'font-playfair italic font-bold',
      mono: 'font-outfit font-semibold',
      specialBg: 'snow',
      dot: '#fde047'
    },
    stealth: {
      id: 'stealth',
      name: 'Matrix Stealth',
      tagline: 'Zero-Trace Pitch Black & Terminal Glow',
      bg: 'bg-black',
      card: 'bg-black/90 backdrop-blur-md border-zinc-800 text-zinc-300 shadow-[0_8px_30px_rgb(0,0,0,0.8)]',
      cardHover: 'hover:border-emerald-500/50',
      accent: 'text-emerald-400',
      accentBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      btn: 'bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold shadow-lg shadow-emerald-500/25',
      font: 'font-mono',
      heading: 'font-mono font-bold tracking-tight',
      mono: 'font-mono',
      specialBg: 'matrix',
      dot: '#34d399'
    }
  };

  const s = themeStyles[theme];

  return (
    <div className="relative min-h-screen">
      {/* ======================================================== */}
      {/* FLOATING TOP VIEW SWITCHER: LOCK SCREEN vs DASHBOARD     */}
      {/* ======================================================== */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-2xl shadow-2xl text-xs font-semibold text-white">
        <button
          onClick={() => setCurrentView('lock')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
            currentView === 'lock'
              ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock size={13} />
          <span>Lock Screen</span>
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
            currentView === 'dashboard'
              ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity size={13} />
          <span>Live Dashboard</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: MODERN SPLIT-SCREEN LOCK SCREEN                  */}
      {/* ======================================================== */}
      {currentView === 'lock' ? (
        <LockScreen onUnlock={() => setCurrentView('dashboard')} />
      ) : (
        /* ======================================================== */
        /* VIEW 2: FULL INTELLIGENCE DASHBOARD WITH INTERACTIVE BG  */
        /* ======================================================== */
        <div
          className={`relative min-h-screen transition-all duration-1000 ${s.bg} ${s.font} overflow-hidden text-white`}
        >
          {/* --- INTERACTIVE DYNAMIC BACKGROUND LAYER --- */}
          <BackgroundEffects type={s.specialBg} />

          {/* --- TOP NAVIGATION BAR --- */}
          <nav className="relative z-40 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-2xl ${s.btn} shadow-2xl transition-transform hover:scale-105`}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${s.heading}`}>
                    Kitna Kharcha <span className="opacity-40 text-sm font-sans font-semibold">2.0</span>
                  </h1>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${s.accentBadge}`}>
                    {s.name}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1.5 mt-0.5">
                  <Activity size={11} className="text-emerald-400" />
                  <span>On-Device Vault Engine • Hardware Encrypted</span>
                </div>
              </div>
            </motion.div>

            {/* Right Action Icons (Skins Drawer & Privacy Toggle) */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto pr-36 sm:pr-40">
              {/* THEMES / SKINS SELECTOR */}
              <div className="relative">
                <button
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className={`px-3.5 py-2.5 rounded-2xl ${s.card} border flex items-center gap-2 transition-transform active:scale-95 shadow-sm text-xs font-bold uppercase tracking-wider`}
                >
                  <Palette size={16} className={s.accent} />
                  <span>Skins</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full ml-0.5 shadow-sm"
                    style={{ backgroundColor: s.dot }}
                  />
                </button>

                {/* EXPANDABLE PALETTE POPUP */}
                <AnimatePresence>
                  {isPaletteOpen && (
                    <motion.div
                      initial={{ y: 15, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 15, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-14 right-0 p-3.5 rounded-3xl border shadow-2xl z-50 grid grid-cols-1 gap-2 w-56 ${s.card}`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 px-2 pb-1 border-b border-white/10">
                        Interactive Skins
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
                                ? 'bg-white/20 text-white shadow-md'
                                : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-3.5 h-3.5 rounded-full shadow-sm"
                                style={{ backgroundColor: item.dot }}
                              />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {isActive && <Check size={14} className="shrink-0" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PRIVACY BLUR TOGGLE */}
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2.5 rounded-2xl ${s.card} border transition-all duration-300 flex items-center gap-1.5 ${
                  privacyMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/20' : ''
                }`}
                title="Toggle Privacy Blur"
              >
                {privacyMode ? <EyeOff size={18} className="text-rose-400 animate-pulse" /> : <Eye size={18} />}
                <span className="text-xs font-bold hidden md:inline">
                  {privacyMode ? 'Blurred' : 'Mask'}
                </span>
              </button>
            </div>
          </nav>

          {/* --- DASHBOARD BENTO GRID --- */}
          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 pb-16">
            
            {/* 1. TOTAL AGGREGATE BALANCE HERO BOX (Fully Responsive) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`col-span-1 md:col-span-8 p-6 sm:p-10 rounded-[2.5rem] border ${s.card} ${s.cardHover} relative overflow-hidden group flex flex-col justify-between transition-all duration-300`}
            >
              <div className="relative z-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase font-black tracking-widest opacity-50">
                    Aggregate Net Liquidity
                  </h3>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.accentBadge} font-mono`}>
                    Auto-Categorized
                  </span>
                </div>

                <div className="my-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={`text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter transition-all duration-500 cursor-pointer ${
                        s.mono
                      } ${privacyMode ? 'filter blur-2xl select-none opacity-20' : ''}`}
                      title={privacyMode ? 'Hover to reveal' : ''}
                    >
                      ₹2,84,200<span className="text-xl md:text-4xl opacity-40">.50</span>
                    </span>
                    <span className={`text-xs font-bold ${s.accent} bg-white/5 px-2.5 py-1 rounded-lg border border-white/10`}>
                      +₹12.5k this month
                    </span>
                  </div>
                </div>

                {/* 4 Mini Stat Blocks */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MiniStat label="Monthly Inflow" val="₹1,20,000" color="text-emerald-400" privacy={privacyMode} mono={s.mono} />
                  <MiniStat label="Total Outflow" val="₹45,850" color="text-orange-400" privacy={privacyMode} mono={s.mono} />
                  <MiniStat label="Net Saved" val="₹74,150" color="text-sky-400" privacy={privacyMode} mono={s.mono} />
                  <MiniStat label="AI Risk Level" val="Minimal (0.2%)" color={s.accent} mono={s.mono} />
                </div>
              </div>

              {/* Ambient radial blur blob */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />
            </motion.div>

            {/* 2. AI GENIUS COPILOT BLOCK */}
            <div
              className={`col-span-1 md:col-span-4 ${s.btn} rounded-[2.5rem] p-7 sm:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Sparkles size={40} className="opacity-90 drop-shadow-md" />
                </motion.div>
                <div className="bg-black/30 backdrop-blur-md text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-wider text-white">
                  Copilot Signal
                </div>
              </div>

              <div className="my-6">
                <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase mb-2">
                  Subscription Anomaly
                </div>
                <p className="text-lg sm:text-xl font-bold leading-snug mb-3">
                  "Warning: Your Netflix family plan may be billed twice due to regional switch."
                </p>
                <p className="text-xs opacity-80 leading-relaxed font-sans">
                  Detected duplicate recurring mandate on HDFC Debit ending in 4892.
                </p>
              </div>

              <button
                onClick={() => alert("Simulated: Mandate audit rule created. Duplicate charge blocked.")}
                className="w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
              >
                <span>Audit & Resolve Mandate</span>
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* 3. TRANSACTIONS FEED (Bento Card) */}
            <div
              className={`col-span-1 md:col-span-12 lg:col-span-7 rounded-[2.5rem] border ${s.card} ${s.cardHover} p-6 sm:p-8 shadow-xl transition-all duration-300`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xl font-bold tracking-tight">Local Intelligence Stream</h4>
                  <p className="text-xs opacity-50 mt-0.5">Real-time classification via Tier 1-3 AI pipeline</p>
                </div>
                <div className="px-3.5 py-1 rounded-full border border-dashed border-white/20 opacity-60 text-[10px] font-mono uppercase tracking-wider">
                  Tiered Categorization
                </div>
              </div>

              <div className="space-y-2.5">
                <TransactionRow name="Urban Company" type="Home Services" price="₹4,500.00" tier="Tier 1: Regex Match" privacy={privacyMode} s={s} mono={s.mono} />
                <TransactionRow name="Blinkit Quick" type="Groceries & Quick Commerce" price="₹892.00" tier="Tier 1: Keyword Match" privacy={privacyMode} s={s} mono={s.mono} />
                <TransactionRow name="Jio Fiber Ultra" type="Home Internet & Utilities" price="₹1,099.00" tier="Tier 2: Pattern Sync" privacy={privacyMode} s={s} mono={s.mono} />
                <TransactionRow name="Apple Services" type="iCloud+ 2TB Storage" price="₹199.00" tier="Tier 3: LLM Refined" privacy={privacyMode} s={s} mono={s.mono} />
              </div>
            </div>

            {/* 4. LOCAL STATEMENT DROPZONE PROMPT */}
            <div
              className={`col-span-1 md:col-span-12 lg:col-span-5 rounded-[2.5rem] border ${s.card} ${s.cardHover} p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative group overflow-hidden`}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-white/10 opacity-30 blur-xl rounded-full animate-pulse" />
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center relative z-10 border border-white/15 group-hover:scale-105 transition-transform">
                  <Wallet size={32} className={s.accent} />
                </div>
              </div>

              <h5 className="font-bold text-lg mb-1.5">Drop Bank Statements Here</h5>
              <p className="text-xs opacity-60 max-w-xs mb-5 leading-relaxed font-sans">
                Drag PDF or CSV statements from HDFC, SBI, ICICI, Axis. Local OCR parsing starts immediately.
              </p>

              <div className="w-full bg-black/20 p-3 rounded-2xl border border-dashed border-white/20 text-center">
                <span className="text-[10px] font-mono tracking-wider opacity-70">
                  ENCRYPTED_VAULT_STANDBY • AES_256_GCM
                </span>
              </div>
            </div>

          </main>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

// Dynamic Background Layer with Particles / Animations
const BackgroundEffects = ({ type }) => {
  if (type === 'stars') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Shooting Stars */}
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            initial={{ top: -40, left: `${(i * 17) % 100}%`, opacity: 0 }}
            animate={{
              top: '120%',
              left: `${((i * 17) % 100) - 20}%`,
              opacity: [0, 0.9, 0]
            }}
            transition={{
              duration: 2.5 + (i % 3),
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 1.8) % 12
            }}
            className="absolute w-[2px] h-14 bg-gradient-to-t from-yellow-300 via-indigo-300 to-transparent -rotate-45"
          />
        ))}

        {/* Twinkling Starfield */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              top: `${(i * 37) % 100}%`,
              left: `${(i * 23) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.15,
              animation: `pulse ${(i % 4) + 2}s cubic-bezier(0.4, 0, 0.6, 1) infinite`
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'cats') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cat-${i}`}
            animate={{
              y: [0, -45, 0],
              x: [0, (i % 2 === 0 ? 25 : -25), 0],
              rotate: [0, (i % 2 === 0 ? 12 : -12), 0],
              opacity: [0.04, 0.12, 0.04]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5
            }}
            className="absolute text-purple-200"
            style={{
              top: `${15 + (i * 14)}%`,
              left: `${10 + (i * 15)}%`
            }}
          >
            <Cat size={110 + (i % 3) * 30} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'snow') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            initial={{ top: -20, left: `${(i * 9) % 100}%`, opacity: 0 }}
            animate={{
              top: '110%',
              x: [0, 15, -15, 0],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i * 0.7) % 8
            }}
            className="absolute text-white/50"
          >
            <Snowflake size={14 + (i % 3) * 6} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'matrix') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] [background-size:32px_32px]" />
    );
  }

  return null;
};

const MiniStat = ({ label, val, color, privacy, mono }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1">
      {label}
    </span>
    <span
      className={`text-lg sm:text-xl font-bold ${color} ${mono} ${
        privacy ? 'filter blur-md select-none transition-all' : ''
      }`}
    >
      {val}
    </span>
  </div>
);

const TransactionRow = ({ name, type, price, tier, privacy, s, mono }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.15 }}
    className="flex justify-between items-center p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group"
  >
    <div className="flex items-center gap-3.5">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base border border-white/10 ${s.btn} bg-opacity-25 shrink-0 group-hover:scale-105 transition-transform`}
      >
        {name[0]}
      </div>
      <div>
        <p className="font-bold text-sm tracking-tight">{name}</p>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
          {type} • <span className={s.accent}>{tier}</span>
        </p>
      </div>
    </div>
    <p
      className={`font-bold text-base sm:text-lg tracking-tight ${mono} ${
        privacy ? 'filter blur-lg select-none hover:blur-none transition-all' : ''
      }`}
      title={privacy ? 'Hover to reveal' : ''}
    >
      -{price}
    </p>
  </motion.div>
);
