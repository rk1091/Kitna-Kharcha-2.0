import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOff, Eye, Sparkles, Cat, Gift, Zap, Moon, Sun, 
  ShieldCheck, ChevronRight, Palette, Star, Flame, Snowflake, 
  Activity, Trees, Flower2, Heart, Check, Coffee, ArrowUpRight
} from 'lucide-react';

const App = () => {
  const [theme, setTheme] = useState('cozy'); // Default: Cozy Hearth
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // ALL 12 SKINS ACROSS ALL COMMITS AND ITERATIONS
  const themeStyles = {
    // 1. COZY HEARTH (Warm Beige & Maroon)
    cozy: {
      id: 'cozy',
      name: "Cozy Hearth",
      category: "Aesthetic",
      tagline: "Warm Paper, Oxblood Maroon & Editorial Serif",
      bg: "bg-[#F5F2ED]", 
      card: "bg-white/80 backdrop-blur-md border-[#D9CEB2] text-[#2D241E] shadow-[0_8px_30px_rgb(217,206,178,0.25)]",
      accent: "text-[#800000]",
      badge: "bg-[#800000]/10 text-[#800000] border-[#800000]/20",
      btn: "bg-[#800000] hover:bg-[#6b0000] text-white shadow-lg shadow-[#800000]/25",
      font: "font-playfair",
      heading: "font-playfair italic font-bold",
      mono: "font-outfit font-semibold",
      icon: <Gift size={16} className="text-[#800000]" />,
      dot: "#800000"
    },

    // 2. CHRISTMAS MORNING (Deep Festive Red with Falling Snow)
    christmas: {
      id: 'christmas',
      name: "Christmas Morning",
      category: "Aesthetic",
      tagline: "Deep Festive Red & Falling Snowflakes",
      bg: "bg-[#451010]",
      card: "bg-white/10 backdrop-blur-md border-red-300/20 text-red-50 shadow-[0_8px_30px_rgb(127,29,29,0.35)]",
      accent: "text-yellow-300",
      badge: "bg-yellow-300/15 text-yellow-200 border-yellow-300/30",
      btn: "bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-950/40",
      font: "font-playfair",
      heading: "font-playfair italic font-bold",
      mono: "font-outfit font-semibold",
      specialBg: "snow",
      icon: <Snowflake size={16} className="text-yellow-300" />,
      dot: "#dc2626"
    },

    // 3. NEKO KAWAII 2.0 (Deep Mystic Purple)
    neko: {
      id: 'neko',
      name: "Neko Kawaii 2.0",
      category: "Aesthetic",
      tagline: "Deep Mystic Purple & Floating Cats",
      bg: "bg-[#2D1B4E]",
      card: "bg-[#3B2667]/70 backdrop-blur-xl border-purple-400/20 text-pink-50 shadow-[0_8px_30px_rgb(91,33,182,0.35)]",
      accent: "text-pink-300",
      badge: "bg-pink-400/15 text-pink-300 border-pink-400/30",
      btn: "bg-[#B794F4] hover:bg-[#a57ced] text-white shadow-lg shadow-purple-500/30",
      font: "font-quicksand",
      heading: "font-quicksand font-bold",
      mono: "font-quicksand font-bold",
      specialBg: "cats",
      icon: <Cat size={16} className="text-pink-300" />,
      dot: "#B794F4"
    },

    // 4. NEKO PASTEL (Original Soft Lavender)
    nekoPastel: {
      id: 'nekoPastel',
      name: "Neko Lavender",
      category: "Aesthetic",
      tagline: "Pastel Lavender & Soft Cute Vibes",
      bg: "bg-[#F0E6FF]",
      card: "bg-white/85 backdrop-blur-xl border-[#D1BBFF] text-[#4A376E] shadow-[0_8px_30px_rgb(209,187,255,0.4)]",
      accent: "text-[#6B46C1]",
      badge: "bg-[#6B46C1]/10 text-[#6B46C1] border-[#6B46C1]/20",
      btn: "bg-[#6B46C1] hover:bg-[#5835A8] text-white shadow-md shadow-[#6B46C1]/20",
      font: "font-quicksand",
      heading: "font-quicksand font-bold",
      mono: "font-quicksand font-bold",
      specialBg: "cats",
      icon: <Heart size={16} className="text-[#6B46C1]" />,
      dot: "#6B46C1"
    },

    // 5. STARRY NIGHT (Deep Indigo & Shooting Stars)
    starry: {
      id: 'starry',
      name: "Starry Night",
      category: "Cosmic",
      tagline: "Cosmic Navy, Stardust & Falling Stars",
      bg: "bg-[#020617]",
      card: "bg-white/5 backdrop-blur-xl border-white/10 text-indigo-50 shadow-[0_8px_30px_rgb(49,46,129,0.3)]",
      accent: "text-yellow-400",
      badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
      btn: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30",
      font: "font-space",
      heading: "font-space font-bold tracking-tight",
      mono: "font-space font-bold",
      specialBg: "stars",
      icon: <Star size={16} className="text-yellow-400" />,
      dot: "#eab308"
    },

    // 6. MIDNIGHT NAVY (Professional Slate Dark)
    midnight: {
      id: 'midnight',
      name: "Midnight Navy",
      category: "Pro Dark",
      tagline: "Slate Obsidian & Electric Cobalt Glow",
      bg: "bg-[#0F172A]",
      card: "bg-[#1E293B]/70 backdrop-blur-xl border-slate-700/80 text-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.4)]",
      accent: "text-blue-400",
      badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30",
      font: "font-outfit",
      heading: "font-outfit font-bold tracking-tight",
      mono: "font-mono",
      icon: <Moon size={16} className="text-blue-400" />,
      dot: "#3b82f6"
    },

    // 7. OG STEALTH MATRIX (Pitch Black & Neon Green)
    stealth: {
      id: 'stealth',
      name: "OG Stealth Matrix",
      category: "Pro Dark",
      tagline: "Pure Black Terminal & Cyber Neon",
      bg: "bg-black",
      card: "bg-zinc-950/80 backdrop-blur-md border-zinc-800 text-zinc-300 shadow-[0_8px_30px_rgb(0,0,0,0.8)]",
      accent: "text-[#00FF94]",
      badge: "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30",
      btn: "bg-[#00FF94] hover:bg-[#00dd80] text-black font-mono font-bold shadow-lg shadow-[#00FF94]/25",
      font: "font-mono",
      heading: "font-mono font-bold tracking-tight",
      mono: "font-mono",
      specialBg: "matrix",
      icon: <Zap size={16} className="text-[#00FF94]" />,
      dot: "#00FF94"
    },

    // 8. MIDNIGHT CYBER (Rich Black & Neon Purple)
    cyberPurple: {
      id: 'cyberPurple',
      name: "Midnight Cyber",
      category: "Pro Dark",
      tagline: "Deep Obsidian Vault & Neon Violet Glow",
      bg: "bg-[#090a0f]",
      card: "bg-[#12131d]/80 backdrop-blur-md border-white/10 text-zinc-100 shadow-[0_8px_30px_rgb(168,85,247,0.15)]",
      accent: "text-[#a855f7]",
      badge: "bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30",
      btn: "bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-lg shadow-purple-500/25",
      font: "font-inter",
      heading: "font-inter font-bold tracking-tight",
      mono: "font-mono",
      icon: <Sparkles size={16} className="text-[#a855f7]" />,
      dot: "#a855f7"
    },

    // 9. ECO WEALTH (Deep Emerald & Gold)
    eco: {
      id: 'eco',
      name: "Eco Wealth",
      category: "Wealth",
      tagline: "Emerald Forest, Sustainable Prosperity & Gold",
      bg: "bg-[#071911]",
      card: "bg-[#0e291e]/80 backdrop-blur-md border-emerald-500/20 text-emerald-50 shadow-[0_8px_30px_rgb(16,185,129,0.15)]",
      accent: "text-[#fbbf24]",
      badge: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
      btn: "bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/25",
      font: "font-outfit",
      heading: "font-outfit font-bold tracking-tight",
      mono: "font-mono",
      icon: <Trees size={16} className="text-[#10b981]" />,
      dot: "#10b981"
    },

    // 10. OG SOLAR (Warm Off-White & Electric Orange)
    solar: {
      id: 'solar',
      name: "OG Solar Growth",
      category: "Minimal Light",
      tagline: "Warm Sunlight, Electric Orange & Momentum",
      bg: "bg-[#FFF9F5]",
      card: "bg-white border-orange-100 text-slate-800 shadow-[0_8px_30px_rgb(249,115,22,0.08)]",
      accent: "text-orange-600",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      btn: "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25",
      font: "font-outfit",
      heading: "font-outfit font-bold tracking-tight",
      mono: "font-mono",
      icon: <Flame size={16} className="text-orange-600" />,
      dot: "#ea580c"
    },

    // 11. OG NORDIC (Alpine Frost Minimal)
    nordic: {
      id: 'nordic',
      name: "OG Nordic Frost",
      category: "Minimal Light",
      tagline: "Ice Blue Minimalist Ledger & Calm Focus",
      bg: "bg-[#F8FAFC]",
      card: "bg-white border-blue-50 text-slate-700 shadow-[0_8px_30px_rgb(2,132,199,0.06)]",
      accent: "text-blue-500",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      btn: "bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-800/20",
      font: "font-inter",
      heading: "font-inter font-semibold tracking-tight",
      mono: "font-mono",
      icon: <Snowflake size={16} className="text-blue-400" />,
      dot: "#0284c7"
    },

    // 12. MODERN PAPER (Clean Swiss Monochrome)
    paper: {
      id: 'paper',
      name: "Modern Paper",
      category: "Minimal Light",
      tagline: "Clean Swiss Editorial Monochrome",
      bg: "bg-white",
      card: "bg-[#F9F9F9] border-gray-200 text-black shadow-[0_4px_20px_rgb(0,0,0,0.03)]",
      accent: "text-blue-600",
      badge: "bg-gray-100 text-black border-gray-300",
      btn: "bg-black hover:bg-zinc-800 text-white shadow-md",
      font: "font-inter",
      heading: "font-inter font-extrabold tracking-tight",
      mono: "font-mono",
      icon: <Sun size={16} className="text-zinc-800" />,
      dot: "#18181b"
    }
  };

  const s = themeStyles[theme] || themeStyles.cozy;

  return (
    <div className={`relative min-h-screen transition-all duration-700 ${s.bg} ${s.font} ${s.card.includes('text-') ? '' : 'text-slate-800'} overflow-hidden`}>
      
      {/* BACKGROUND INTERACTIVE LAYER */}
      <BackgroundEffects type={s.specialBg} />

      {/* HEADER NAV */}
      <nav className="relative z-50 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <div className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1.5 font-sans mt-0.5">
              <Activity size={10} />
              <span>{s.tagline}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* EXPANDABLE MASTER PALETTE DRAWER */}
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
                  className={`absolute right-0 mt-3 p-3.5 rounded-3xl border shadow-2xl z-[100] w-72 sm:w-80 ${s.card} max-h-[80vh] overflow-y-auto`}
                >
                  <div className="px-2 pb-2 mb-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50 font-sans">
                    <span>Master Skin Palette</span>
                    <span>12 Themes</span>
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
            title="Toggle Privacy Blur"
          >
            {privacyMode ? <EyeOff size={18} className="text-red-500" /> : <Eye size={18} />}
          </button>
        </div>
      </nav>

      {/* DASHBOARD BENTO CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
        
        {/* 1. TOTAL CASH LIQUIDITY CARD */}
        <div className={`col-span-12 md:col-span-8 p-8 sm:p-12 md:p-14 rounded-[3rem] border ${s.card} shadow-2xl relative overflow-hidden group transition-all duration-300`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-widest opacity-50 font-sans">
                Total Net Liquidity
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.badge} font-mono`}>
                ✨ AI Confidence: 99.8%
              </span>
            </div>

            <div className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter transition-all duration-700 cursor-pointer ${s.mono} ${privacyMode ? 'filter blur-2xl opacity-10 select-none' : ''}`}
                 title={privacyMode ? 'Hover to reveal' : ''}
            >
              ₹3,42,000<span className="text-3xl md:text-5xl opacity-20">.00</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${s.badge} font-sans`}>
                Tier 1-3 Engine: Synced
              </span>
              <span className="text-xs opacity-50 font-sans">
                Next salary cycle in 5 days
              </span>
            </div>
          </div>
          <div className={`absolute top-0 right-0 w-80 h-80 rounded-full bg-current opacity-[0.03] blur-3xl -mr-20 -mt-20 pointer-events-none`} />
        </div>

        {/* 2. AI GENIUS COPILOT BLOCK */}
        <div className={`col-span-12 md:col-span-4 ${s.btn} rounded-[3rem] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300`}>
          <Sparkles size={44} className="opacity-70 group-hover:rotate-12 transition-transform duration-300" />
          <div className="my-6">
            <h4 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
              "You have ₹4,200 in recurring subscriptions you haven't used in 90 days."
            </h4>
            <p className="text-xs opacity-75 font-sans uppercase tracking-widest">
              AI Logic Refined • Yesterday
            </p>
          </div>
          <button 
            onClick={() => alert("Simulation: Unused recurring subscriptions flagged for cancellation.")}
            className="w-full bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <span>Optimize My Wealth</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* 3. STATEMENT INTELLIGENCE FEED */}
        <div className={`col-span-12 rounded-[3rem] border ${s.card} p-6 sm:p-10 shadow-sm transition-all duration-300`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.heading}`}>
                Statement Intelligence Feed
              </h4>
              <p className="text-xs opacity-50 font-sans mt-0.5">
                Automated substring normalization & multi-tier categorization
              </p>
            </div>
            <span className="text-xs font-mono opacity-40 uppercase tracking-widest hidden sm:inline">
              Real-time Ingestion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TxRow name="Uber Premium" type="Travel" price="₹420.00" tier="Tier 1: Keyword" privacy={privacyMode} s={s} />
            <TxRow name="Amazon.in" type="Shopping" price="₹2,100.00" tier="Tier 3: LLM Refined" privacy={privacyMode} s={s} />
            <TxRow name="Swiggy" type="Food & Dining" price="₹650.00" tier="Tier 1: Substring" privacy={privacyMode} s={s} />
            <TxRow name="Netflix Premium" type="Entertainment" price="₹499.00" tier="Tier 2: Pattern Sync" privacy={privacyMode} s={s} />
          </div>
        </div>
      </main>
    </div>
  );
};

// =========================================================================
// BACKGROUND EFFECTS
// =========================================================================
const BackgroundEffects = ({ type }) => {
  if (type === 'stars') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Shooting Stars */}
        {[...Array(15)].map((_, i) => (
          <motion.div 
            key={`shooting-${i}`} 
            initial={{ top: -10, left: `${(i * 19) % 100}%` }}
            animate={{ top: '110%' }}
            transition={{ duration: 3.5 + (i % 3), repeat: Infinity, ease: "linear", delay: (i * 1.5) % 8 }}
            className="absolute w-[2px] h-14 bg-gradient-to-t from-yellow-400 to-transparent"
          />
        ))}
        {/* Twinkling dots */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white opacity-20 animate-pulse"
            style={{ top: `${(i * 27) % 100}%`, left: `${(i * 31) % 100}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === 'cats') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={`cat-${i}`} 
            animate={{ y: [0, -35, 0], x: [0, 15, 0], rotate: [0, 12, 0] }} 
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute text-purple-200" 
            style={{ top: `${15 + i * 18}%`, left: `${10 + i * 18}%` }}
          >
            <Cat size={140 + (i % 2) * 40} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'snow') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            initial={{ top: -20, left: `${(i * 11) % 100}%` }}
            animate={{ top: '110%', x: [0, 10, -10, 0] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: (i * 0.8) % 6 }}
            className="absolute text-white"
          >
            <Snowflake size={16 + (i % 3) * 6} />
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

const TxRow = ({ name, type, price, tier, privacy, s }) => (
  <motion.div 
    whileHover={{ scale: 1.015 }} 
    className="flex justify-between items-center p-5 sm:p-6 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all border border-black/[0.04] dark:border-white/5 cursor-pointer group"
  >
    <div className="flex items-center gap-4 sm:gap-5">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl ${s.btn} bg-opacity-80 shrink-0 group-hover:scale-105 transition-transform`}>
        {name[0]}
      </div>
      <div>
        <p className="font-bold text-base sm:text-lg leading-snug mb-0.5">{name}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 font-sans">
          {type} • <span className={s.accent}>{tier}</span>
        </p>
      </div>
    </div>
    <p className={`text-xl sm:text-2xl font-black tracking-tight ${s.mono} ${privacy ? 'filter blur-2xl select-none hover:blur-none transition-all' : ''}`}
       title={privacy ? 'Hover to reveal' : ''}
    >
      -{price}
    </p>
  </motion.div>
);

export default App;
