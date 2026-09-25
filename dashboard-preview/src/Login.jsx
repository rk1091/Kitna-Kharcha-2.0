import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Fingerprint, ArrowRight, Github, 
  Chrome, Mail, Lock, Sparkles, Cpu, CheckCircle2, 
  RefreshCw, Star, Cat, Zap, Gift, Snowflake, Moon, 
  Sun, Trees, Waves, Flame, Heart, Shield, Terminal,
  Scan, KeyRound, ChevronDown, Check, Layers, Compass
} from 'lucide-react';

export default function LoginPage({ 
  theme = 'starry', 
  themeStyles = {}, 
  onThemeChange, 
  onLogin 
}) {
  // 3 Distinct Modern Concepts
  // 'geometric': Concept 1 - Geometric Flow (Split layout + 3D morphing orb & aura)
  // 'vault': Concept 2 - Vault Entrance (Centered luxury frosted cylinder & rotating mechanical dial)
  // 'grid': Concept 3 - Grid Guard (Cyber perspective 3D horizon grid & laser HUD)
  const [activeConcept, setActiveConcept] = useState('geometric');
  const [email, setEmail] = useState('agent@private.id');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Get current theme style or fallback
  const s = themeStyles[theme] || {
    id: 'starry',
    name: 'Starry Night 2.0',
    tagline: 'Deep Cosmic Navy & Shooting Stars',
    bg: 'bg-[#020617]',
    card: 'bg-white/5 backdrop-blur-xl border-white/10 text-indigo-50 shadow-2xl',
    accent: 'text-yellow-400',
    badge: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
    btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    font: 'font-space',
    heading: 'font-space font-bold',
    mono: 'font-space font-bold',
    icon: <Star size={18} className="text-yellow-400" />,
    dot: '#eab308'
  };

  // Mouse move parallax for interactive 3D effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 30,
      y: (clientY / innerHeight - 0.5) * 30
    });
  };

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    if (isAuthenticating || authSuccess) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 700);
    }, 1100);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen w-full transition-colors duration-700 ${s.bg} ${s.font} text-white overflow-hidden select-none flex flex-col justify-between`}
    >
      {/* ======================================================== */}
      {/* TOP CONTROL BAR: CONCEPT SWITCHER & THEME PICKER          */}
      {/* ======================================================== */}
      <header className="relative z-50 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
            style={{ backgroundColor: `${s.dot}33` }}
          >
            <ShieldCheck size={18} style={{ color: s.dot }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-tight ${s.heading}`}>
                Kitna Kharcha <span className="opacity-40 text-xs">2.0 Vault</span>
              </span>
              <span 
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 font-mono hidden sm:inline-block"
                style={{ color: s.dot }}
              >
                AES-256 GCM
              </span>
            </div>
          </div>
        </div>

        {/* Center: Modern Concept Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveConcept('geometric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeConcept === 'geometric'
                ? 'bg-white text-black shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Concept 1: Split Screen with 3D Morphing Organic Shape & Ambient Aura"
          >
            <span>💎</span>
            <span className="hidden md:inline">Concept 1:</span>
            <span>Geometric Flow</span>
          </button>

          <button
            onClick={() => setActiveConcept('vault')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeConcept === 'vault'
                ? 'bg-white text-black shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Concept 2: Centered Swiss Frosted Vault Cylinder & Rotating Mechanical Dial"
          >
            <span>🏛️</span>
            <span className="hidden md:inline">Concept 2:</span>
            <span>Vault Entrance</span>
          </button>

          <button
            onClick={() => setActiveConcept('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeConcept === 'grid'
                ? 'bg-white text-black shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Concept 3: Cyber-Tech Perspective Grid & Laser Scanning HUD"
          >
            <span>⚡</span>
            <span className="hidden md:inline">Concept 3:</span>
            <span>Grid Guard</span>
          </button>
        </div>

        {/* Right: Theme Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: s.dot }}
            />
            <span>{s.name}</span>
            <ChevronDown size={14} className="opacity-60" />
          </button>

          <AnimatePresence>
            {showThemePicker && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-zinc-950/95 border border-white/15 shadow-2xl backdrop-blur-2xl z-[100] max-h-80 overflow-y-auto"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 mb-1">
                  Select Visual Theme ({Object.keys(themeStyles).length})
                </div>
                <div className="space-y-1">
                  {Object.keys(themeStyles).map((key) => {
                    const item = themeStyles[key];
                    const isSelected = theme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (onThemeChange) onThemeChange(key);
                          setShowThemePicker(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.dot }}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT: RENDERING ACTIVE CONCEPT                   */}
      {/* ======================================================== */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {activeConcept === 'geometric' && (
            <ConceptGeometricFlow
              key="geometric"
              s={s}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isAuthenticating={isAuthenticating}
              authSuccess={authSuccess}
              handleUnlock={handleUnlock}
              mousePos={mousePos}
            />
          )}

          {activeConcept === 'vault' && (
            <ConceptVaultEntrance
              key="vault"
              s={s}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isAuthenticating={isAuthenticating}
              authSuccess={authSuccess}
              handleUnlock={handleUnlock}
              mousePos={mousePos}
            />
          )}

          {activeConcept === 'grid' && (
            <ConceptGridGuard
              key="grid"
              s={s}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isAuthenticating={isAuthenticating}
              authSuccess={authSuccess}
              handleUnlock={handleUnlock}
              mousePos={mousePos}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ======================================================== */}
      {/* FOOTER: SECURITY AUDIT & DIRECT DASHBOARD BYPASS          */}
      {/* ======================================================== */}
      <footer className="relative z-40 px-6 py-2.5 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SESSION: 0x{theme.slice(0, 4).toUpperCase()}</span>
          </div>
          <span className="opacity-30">•</span>
          <span className="hidden sm:inline">Zero Cloud Persistence Mode</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="opacity-70 font-mono text-[10px]">
            ACTIVE SKIN: {s.name.toUpperCase()}
          </span>
          <button
            onClick={onLogin}
            className="text-white hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
            style={{ color: s.dot }}
          >
            <span>Skip to Dashboard</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// CONCEPT 1: THE "GEOMETRIC FLOW" (SPLIT-SCREEN + 3D MORPHING LIVING ORB)
// =========================================================================
function ConceptGeometricFlow({
  s,
  email,
  setEmail,
  password,
  setPassword,
  isAuthenticating,
  authSuccess,
  handleUnlock,
  mousePos
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex flex-col lg:flex-row items-center justify-between"
    >
      {/* --- LEFT SECTION: DYNAMIC 3D ART & LIVING CORE --- */}
      <div className="relative w-full lg:w-7/12 h-[45vh] lg:h-full flex flex-col items-center justify-center p-8 sm:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Animated Radial Theme Aura */}
        <div 
          className="absolute w-[140%] h-[140%] blur-[130px] opacity-25 pointer-events-none transition-all duration-1000"
          style={{ background: `radial-gradient(circle at center, ${s.dot}, transparent 70%)` }}
        />

        {/* Parallax Motion Container */}
        <motion.div
          animate={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: 'spring', damping: 25, stiffness: 60 }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* THE 3D MORPHING LIVING ORB */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
            {/* Ambient Pulsing Core Glow */}
            <div 
              className="absolute inset-0 rounded-full blur-[70px] opacity-40 animate-pulse transition-colors duration-700"
              style={{ backgroundColor: s.dot }}
            />

            {/* Rotating Outer Gyroscope Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-12px] rounded-full border border-dashed border-white/20 pointer-events-none"
            />

            {/* Morphing Organic Glass Mesh */}
            <motion.div
              animate={{
                borderRadius: ["42% 58% 70% 30%", "60% 40% 30% 70%", "50% 50% 60% 40%", "42% 58% 70% 30%"],
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.04, 0.98, 1]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border-2 border-white/30 bg-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: `0 0 50px ${s.dot}33, inset 0 0 30px rgba(255,255,255,0.15)`
              }}
            >
              {/* Dynamic Theme Glyphs floating inside */}
              <div 
                className="scale-[3.5] opacity-90 transition-transform duration-500 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                style={{ color: s.dot }}
              >
                {s.icon}
              </div>
            </motion.div>

            {/* Orbiting Satellite Particle */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20px] pointer-events-none"
            >
              <div 
                className="w-4 h-4 rounded-full shadow-[0_0_15px_white] blur-[1px]"
                style={{ backgroundColor: s.dot }}
              />
            </motion.div>
          </div>

          {/* Tagline & Core Details */}
          <div className="mt-8 text-center relative z-10">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${s.heading} drop-shadow-md`}>
              Kitna Kharcha <span className="opacity-40 text-xl md:text-2xl font-sans">2.0</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto font-light leading-relaxed">
              Tier-1 Autonomous Banking Enclave. Zero cloud telemetry.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span 
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-black/30 font-mono"
                style={{ color: s.dot }}
              >
                {s.name} Aesthetic
              </span>
            </div>
          </div>
        </motion.div>

        {/* Dynamic perspective floor grid */}
        <div 
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)' }} 
          className="absolute bottom-0 w-full h-1/3 opacity-[0.04] bg-[size:36px_36px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none"
        />
      </div>

      {/* --- RIGHT SECTION: HIGH-END GLASS AUTH FORM --- */}
      <div className="relative w-full lg:w-5/12 p-6 sm:p-12 flex items-center justify-center">
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-2xl relative"
        >
          <div className="mb-8">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 mb-3 inline-block"
              style={{ color: s.dot, backgroundColor: `${s.dot}15` }}
            >
              Geometric Concept
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Unseal Ledger</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">Provide neural credentials or one-tap biometrics.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Master Identifier
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 opacity-40" size={17} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/40 transition-all font-sans"
                  placeholder="agent@private.id"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Neural Passphrase
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 opacity-40" size={17} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/40 transition-all font-sans"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isAuthenticating || authSuccess}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all ${s.btn}`}
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Unsealing Enclave...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 size={16} className="text-white" />
                  <span>Vault Decrypted</span>
                </>
              ) : (
                <>
                  <span>Decrypt & Enter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full h-px bg-white/10" />
              <span className="absolute bg-zinc-950 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Fast Authenticate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleUnlock}
                className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all"
              >
                <Fingerprint size={16} style={{ color: s.dot }} />
                <span>Biometrics</span>
              </button>
              <button
                type="button"
                onClick={handleUnlock}
                className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all"
              >
                <Chrome size={16} className="text-blue-400" />
                <span>SSO Enclave</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

// =========================================================================
// CONCEPT 2: THE "VAULT ENTRANCE" (MODERN MINIMALIST / PRIVATE BANKING)
// =========================================================================
function ConceptVaultEntrance({
  s,
  email,
  setEmail,
  password,
  setPassword,
  isAuthenticating,
  authSuccess,
  handleUnlock,
  mousePos
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-10"
    >
      {/* Ambient Spotlight Behind the Center Cylinder */}
      <div 
        className="absolute w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-[140px] opacity-20 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: s.dot }}
      />

      {/* Main Luxury Vault Cylinder Card */}
      <motion.div
        animate={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className="relative z-10 w-full max-w-lg p-8 sm:p-12 rounded-[3.5rem] bg-black/40 border border-white/20 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col items-center text-center"
      >
        {/* MECHANICAL VAULT WHEEL EMBLEM */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 flex items-center justify-center">
          {/* Rotating Outer Dial with Tick Marks */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/25"
          />
          {/* Reverse Rotating Inner Dial */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2.5 rounded-full border border-white/10"
          />
          {/* Center Chamber with Theme Icon */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border border-white/30 backdrop-blur-md"
            style={{ 
              backgroundColor: `${s.dot}25`,
              boxShadow: `0 0 30px ${s.dot}40`
            }}
          >
            <div className="scale-150" style={{ color: s.dot }}>
              {s.icon}
            </div>
          </div>
        </div>

        {/* Luxury Typography */}
        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-2 ${s.heading}`}>
          The Private Vault
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mb-8 leading-relaxed font-light">
          Kitna Kharcha 2.0 Autonomous Banking Suite. Protected by hardware-isolated neural verification.
        </p>

        {/* Minimalist Input Form */}
        <form onSubmit={handleUnlock} className="w-full space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Master Security Key"
              className="w-full bg-white/5 border border-white/15 rounded-2xl py-4 px-6 text-center text-base tracking-[0.3em] font-mono text-white placeholder-zinc-500 outline-none focus:border-white/50 focus:ring-4 transition-all"
              style={{ "--tw-ring-color": `${s.dot}25` }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isAuthenticating || authSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-2xl transition-all ${s.btn}`}
          >
            {isAuthenticating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Rotating Vault Tumbler...</span>
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Vault Unlocked</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Unseal Banking Suite</span>
              </>
            )}
          </motion.button>

          {/* Quick Biometric Thumbprint Sensor Button */}
          <div className="pt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleUnlock}
              className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 group shadow-lg"
              title="One-Tap Touch ID Unlock"
            >
              <Fingerprint 
                size={26} 
                className="group-hover:opacity-100 opacity-60 transition-opacity"
                style={{ color: s.dot }}
              />
            </button>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              Touch ID / Biometric Pass
            </span>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// =========================================================================
// CONCEPT 3: THE "GRID GUARD" (CYBER-TECH / TERMINAL HUD)
// =========================================================================
function ConceptGridGuard({
  s,
  email,
  setEmail,
  password,
  setPassword,
  isAuthenticating,
  authSuccess,
  handleUnlock,
  mousePos
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden font-mono"
    >
      {/* 3D PERSPECTIVE HORIZON GRID FLOOR */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          perspective: '600px',
          overflow: 'hidden'
        }}
      >
        <div 
          className="absolute inset-[-100%] w-[300%] h-[300%]"
          style={{
            transform: 'rotateX(65deg) translateY(-20%)',
            backgroundImage: `linear-gradient(${s.dot} 1.5px, transparent 1.5px), linear-gradient(90deg, ${s.dot} 1.5px, transparent 1.5px)`,
            backgroundSize: '50px 50px',
            opacity: 0.25,
            maskImage: 'linear-gradient(to bottom, transparent 20%, black 80%)'
          }}
        />
      </div>

      {/* SWEEPING LASER SCANLINE */}
      <motion.div
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-1 pointer-events-none opacity-40 shadow-[0_0_20px]"
        style={{ 
          backgroundColor: s.dot,
          boxShadow: `0 0 25px ${s.dot}`
        }}
      />

      {/* FLOATING HUD CARD */}
      <motion.div
        animate={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
        transition={{ type: 'spring', damping: 25, stiffness: 70 }}
        className="relative z-10 w-full max-w-lg p-6 sm:p-10 rounded-2xl bg-black/80 border backdrop-blur-2xl shadow-2xl"
        style={{ borderColor: `${s.dot}44` }}
      >
        {/* HUD TOP DIAGNOSTIC BAR */}
        <div className="flex items-center justify-between border-b pb-3 mb-6 text-[10px] uppercase tracking-widest text-zinc-400" style={{ borderColor: `${s.dot}33` }}>
          <div className="flex items-center gap-2">
            <Terminal size={14} style={{ color: s.dot }} />
            <span>SYS_CORE://KK2.ENCLAVE</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold" style={{ color: s.dot }}>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: s.dot }} />
            <span>ENCLAVE ARMED</span>
          </div>
        </div>

        {/* HUD HEADLINE */}
        <div className="mb-6">
          <div className="text-[11px] text-zinc-500 uppercase tracking-widest mb-1">
            PROTOCOL: ZERO_EGRESS_AI
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>GRID_GUARD</span>
            <span style={{ color: s.dot }}>v2.4</span>
          </h2>
        </div>

        {/* TERMINAL INPUT FIELDS */}
        <form onSubmit={handleUnlock} className="space-y-4 text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 block mb-1 tracking-widest uppercase">
              // INPUT 01: SYSTEM IDENTIFIER
            </span>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-500">&gt;</span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border rounded-lg py-3 pl-8 pr-3 text-white placeholder-zinc-600 outline-none transition-all font-mono"
                style={{ borderColor: `${s.dot}44` }}
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block mb-1 tracking-widest uppercase">
              // INPUT 02: NEURAL CRYPTO KEY
            </span>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-500">&gt;</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border rounded-lg py-3 pl-8 pr-3 text-white placeholder-zinc-600 outline-none transition-all font-mono"
                style={{ borderColor: `${s.dot}44` }}
              />
            </div>
          </div>

          {/* TELEMETRY READOUTS */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
            <div>CHIP: <span className="text-white font-bold">LOCAL NPU</span></div>
            <div>CIPHER: <span className="text-white font-bold">AES-256 GCM</span></div>
            <div>LATENCY: <span className="text-white font-bold">0.14ms</span></div>
            <div>THEME_HEX: <span style={{ color: s.dot }} className="font-bold">{s.dot}</span></div>
          </div>

          <motion.button
            type="submit"
            disabled={isAuthenticating || authSuccess}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${s.btn}`}
          >
            {isAuthenticating ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>INITIALIZING UNSEAL PROTOCOL...</span>
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>ACCESS GRANTED: PROTOCOL OK</span>
              </>
            ) : (
              <>
                <Scan size={15} />
                <span>EXECUTE UNSEAL [ENTER]</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
