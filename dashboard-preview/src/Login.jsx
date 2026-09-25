import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ChevronRight, 
  Lock, 
  Mail, 
  Fingerprint, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function ProfessionalLogin({ 
  activeTheme = 'Foundry', 
  onThemeChange, 
  onLogin 
}) {
  const [email, setEmail] = useState('founder@privacy.local');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // 4 Top-Tier Executive Fintech Themes
  const themes = {
    Foundry: {
      id: 'Foundry',
      name: 'Foundry Dark',
      tagline: 'Executive Grade (The "Linear" look)',
      bg: 'bg-[#09090b]',
      card: 'bg-zinc-900/50 border-white/10 text-white',
      input: 'bg-zinc-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/50 placeholder-zinc-500',
      accent: 'text-indigo-400',
      accentBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      gradient: 'from-indigo-900/20 via-zinc-950 to-zinc-950',
      dot: '#6366f1',
      selection: 'selection:bg-indigo-500/30'
    },
    Paper: {
      id: 'Paper',
      name: 'Paper Light',
      tagline: 'Clean, high-trust banking aesthetic (The "Mercury" look)',
      bg: 'bg-[#f8fafc]',
      card: 'bg-white border-slate-200 text-slate-900 shadow-sm',
      input: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500/50 focus:ring-sky-500/50 placeholder-slate-400',
      accent: 'text-sky-600',
      accentBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      gradient: 'from-sky-100/60 via-slate-50 to-slate-50',
      dot: '#0284c7',
      selection: 'selection:bg-sky-500/20'
    },
    Sage: {
      id: 'Sage',
      name: 'Forest / Sage',
      tagline: 'Minimalist, modern wealth management',
      bg: 'bg-[#0a0f0d]',
      card: 'bg-[#0f1814]/70 border-emerald-500/15 text-emerald-50 shadow-xl',
      input: 'bg-[#0f1814]/60 border-emerald-500/20 text-emerald-50 focus:border-emerald-500/50 focus:ring-emerald-500/50 placeholder-emerald-400/40',
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      gradient: 'from-emerald-950/40 via-[#0a0f0d] to-[#0a0f0d]',
      dot: '#10b981',
      selection: 'selection:bg-emerald-500/30'
    },
    Midnight: {
      id: 'Midnight',
      name: 'Midnight AI',
      tagline: 'High-tech AI Intelligence',
      bg: 'bg-[#020420]',
      card: 'bg-[#070b2e]/60 border-blue-500/20 text-blue-50 shadow-2xl',
      input: 'bg-[#070b2e]/50 border-blue-500/20 text-blue-50 focus:border-blue-500/50 focus:ring-blue-500/50 placeholder-blue-300/40',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      gradient: 'from-blue-950/40 via-[#020420] to-[#020420]',
      dot: '#3b82f6',
      selection: 'selection:bg-blue-500/30'
    }
  };

  const t = themes[activeTheme] || themes.Foundry;
  const isLight = activeTheme === 'Paper';

  const handleContinue = (e) => {
    if (e) e.preventDefault();
    if (isAuthenticating || authSuccess) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 500);
    }, 900);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col lg:flex-row ${t.bg} ${isLight ? 'text-slate-900' : 'text-white'} font-sans ${t.selection} transition-colors duration-500`}>
      
      {/* ======================================================== */}
      {/* LEFT SIDE: PRODUCT TEASER (PROFESSIONAL VISUAL)           */}
      {/* ======================================================== */}
      <div className={`w-full lg:w-1/2 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br ${t.gradient} border-b lg:border-b-0 lg:border-r ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        
        {/* Brand header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 ${isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'} rounded-xl flex items-center justify-center shadow-md`}>
                <Shield size={18} />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight">Kitna Kharcha 2.0</span>
                <span className="ml-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 opacity-70">
                  v2.4 LTS
                </span>
              </div>
            </div>

            {/* Quick theme pill switcher on mobile/left header */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md">
              {Object.keys(themes).map((key) => (
                <button
                  key={key}
                  onClick={() => onThemeChange && onThemeChange(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    activeTheme === key 
                      ? 'bg-white text-black font-semibold shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.12]">
            Financial intelligence <br /> 
            <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>
              at the edge of privacy.
            </span>
          </h2>
          <p className={`mt-3 text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-zinc-400'} max-w-md font-normal leading-relaxed`}>
            Upload PDF/CSV statements. Auto-categorize transactions through a 3-tier hybrid AI engine with zero cloud leakage.
          </p>
        </div>

        {/* MOCKUP PREVIEW CARD */}
        <div className={`relative z-10 my-8 sm:my-10 ${t.card} rounded-2xl p-6 backdrop-blur-xl shadow-2xl border ${isLight ? 'bg-white/90' : 'bg-zinc-900/50'}`}>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-zinc-700'}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-zinc-700'}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-zinc-700'}`} />
              </div>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'} tracking-wider uppercase ml-1`}>
                Statement_AI_Engine
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${t.badge}`}>
              Edge Processing: Active
            </span>
          </div>

          {/* Real-time processing progress */}
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-sky-50/60 border-sky-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
              <div className="flex items-center gap-3">
                <RefreshCw size={16} className={`animate-spin ${t.accent}`} />
                <div>
                  <div className={`text-xs font-semibold ${t.accent}`}>
                    Ingesting HDFC_Statement_Sep2026.pdf
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} mt-0.5`}>
                    142 transactions parsed • 0ms external egress
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold ${t.accent}`}>98.2%</span>
            </div>

            {/* Live classification preview items */}
            <div className="space-y-1.5 pt-1">
              <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-white/[0.02] border border-white/5'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">AWS Infrastructure</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                    Tier 3: LLM Precision
                  </span>
                </div>
                <span className="font-mono font-medium">-₹8,400.00</span>
              </div>

              <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-white/[0.02] border border-white/5'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Starbucks Coffee</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                    Tier 1: Regex Rule
                  </span>
                </div>
                <span className="font-mono font-medium">-₹450.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'} pt-4 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <ShieldCheck size={14} className={t.accent} />
            <span>AES-256 GCM Hardware Isolated</span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px]">ISO 27001 Certified UX</span>
        </div>

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 bg-[size:30px_30px] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle, ${isLight ? '#0f172a' : '#fff'} 1px, transparent 1px)` 
          }} 
        />
      </div>

      {/* ======================================================== */}
      {/* RIGHT SIDE: CLEAN LOGIN (FINTECH MINIMAL)                 */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Header & Theme switcher on right */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome back</h1>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                Enter your credentials to access your secure vault.
              </p>
            </div>

            {/* Mobile / Direct theme selector */}
            <div className="sm:hidden flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: t.dot }} />
            </div>
          </div>

          {/* PALETTE SWITCHER BAR */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              Theme:
            </span>
            {Object.keys(themes).map((key) => {
              const item = themes[key];
              const isSelected = activeTheme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onThemeChange && onThemeChange(key)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? isLight 
                        ? 'bg-white text-slate-900 font-semibold shadow-sm' 
                        : 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : isLight 
                        ? 'text-slate-500 hover:text-slate-900' 
                        : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dot }} />
                  <span>{key}</span>
                </button>
              );
            })}
          </div>

          {/* FORM */}
          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'} ml-1`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40`} size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${t.input} rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 transition-all text-sm font-sans`}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Password
                </label>
                <button type="button" className={`text-xs ${isLight ? 'text-sky-600' : 'text-indigo-400'} hover:underline`}>
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40`} size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${t.input} rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 transition-all text-sm font-sans`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating || authSuccess}
              className={`w-full ${isLight ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-white hover:bg-zinc-200 text-black'} font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg`}
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 size={16} className={isLight ? 'text-emerald-400' : 'text-emerald-600'} />
                  <span>Vault Unsealed</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {/* Fast Biometric Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleContinue}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  isLight 
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                    : 'border-white/10 hover:bg-white/5 text-zinc-300'
                }`}
              >
                <Fingerprint size={16} className={t.accent} />
                <span>One-Tap Biometric (Touch ID / Face ID)</span>
              </button>
            </div>
          </form>

          {/* Footer links */}
          <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'} pt-4 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <span>Protected by local enclave</span>
            <button 
              onClick={onLogin}
              className={`font-semibold hover:underline flex items-center gap-1 ${t.accent}`}
            >
              <span>Instant Dashboard ➔</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
