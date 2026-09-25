import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Fingerprint,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Globe,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function LockScreen({ onUnlock }) {
  const [authMode, setAuthMode] = useState('biometric'); // 'biometric' | 'pin' | 'password'
  const [visualMode, setVisualMode] = useState('cosmic'); // 'cosmic' | 'cyber' | 'solar'
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Visual Themes configuration for Left Canvas
  const visuals = {
    cosmic: {
      name: 'Cosmic Nebula',
      bgGradient: 'from-[#0b0c1e] via-[#05060f] to-[#020205]',
      orbCore: 'from-violet-600 via-indigo-500 to-cyan-400',
      glowColor: 'rgba(99, 102, 241, 0.45)',
      accentText: 'text-indigo-400',
      accentBorder: 'border-indigo-500/30',
      accentBg: 'bg-indigo-500/10',
      badge: 'border-indigo-400/30 text-indigo-300 bg-indigo-500/10',
      button: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25',
      particles: 'rgba(167, 139, 250, 0.5)'
    },
    cyber: {
      name: 'Cyber Matrix',
      bgGradient: 'from-[#030d07] via-[#020704] to-[#000000]',
      orbCore: 'from-emerald-500 via-teal-400 to-lime-300',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      accentText: 'text-emerald-400',
      accentBorder: 'border-emerald-500/30',
      accentBg: 'bg-emerald-500/10',
      badge: 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10',
      button: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black font-bold shadow-emerald-500/25',
      particles: 'rgba(52, 211, 153, 0.5)'
    },
    solar: {
      name: 'Solar Horizon',
      bgGradient: 'from-[#170a04] via-[#0a0402] to-[#000000]',
      orbCore: 'from-orange-500 via-rose-500 to-amber-300',
      glowColor: 'rgba(249, 115, 22, 0.45)',
      accentText: 'text-orange-400',
      accentBorder: 'border-orange-500/30',
      accentBg: 'bg-orange-500/10',
      badge: 'border-orange-400/30 text-orange-300 bg-orange-500/10',
      button: 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-orange-500/25',
      particles: 'rgba(251, 146, 60, 0.5)'
    }
  };

  const v = visuals[visualMode];

  // Handle Biometric Simulated Scan
  const handleBiometricScan = () => {
    if (isScanning || scanSuccess) return;
    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 700);
    }, 1200);
  };

  // Handle PIN Input
  const handlePinPress = (digit) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verifyPin = (code) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Demo PIN check (accepts anything or 202609)
      if (code === '202609' || code.length === 6) {
        setScanSuccess(true);
        setTimeout(() => onUnlock(), 600);
      } else {
        setErrorMsg('Invalid Vault PIN code.');
        setPin('');
      }
    }, 500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter master vault password.');
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => onUnlock(), 600);
    }, 600);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${v.bgGradient} text-white font-inter flex flex-col lg:flex-row relative overflow-hidden select-none`}>
      
      {/* Dynamic Background Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Visual Mode Selector Floating Pill */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 flex items-center gap-1">
          <SlidersHorizontal size={11} /> Scene
        </span>
        {Object.keys(visuals).map((mode) => (
          <button
            key={mode}
            onClick={() => setVisualMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              visualMode === mode
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {visuals[mode].name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* LEFT COLUMN: 3D HOLOGRAPHIC VAULT & HARDWARE TELEMETRY   */}
      {/* ======================================================== */}
      <div className="w-full lg:w-7/12 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[460px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 z-10 overflow-hidden">
        
        {/* Top Header info */}
        <div className="pt-10 lg:pt-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-lg">
            <ShieldCheck size={22} className={v.accentText} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Kitna Kharcha</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/70">
                v2.0 VAULT
              </span>
            </div>
            <p className="text-xs text-white/50">Privacy-First AI Financial Intelligence</p>
          </div>
        </div>

        {/* Center: 3D Holographic Vault Orb with Gyroscopic Rings */}
        <div className="my-auto py-8 flex flex-col items-center justify-center relative">
          
          {/* Ambient Aura Glow behind the 3D Sphere */}
          <div
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: v.glowColor }}
          />

          {/* 3D Gyroscopic Rings System */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center [perspective:1000px]">
            
            {/* Outer Gyro Ring 1 (Horizontal tilt orbit) */}
            <motion.div
              animate={{ rotateZ: 360, rotateX: 65 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-white/20 [transform-style:preserve-3d]"
            >
              <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-white shadow-[0_0_12px_#fff]" />
            </motion.div>

            {/* Middle Gyro Ring 2 (Vertical tilt orbit) */}
            <motion.div
              animate={{ rotateZ: -360, rotateY: 70 }}
              transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
              className="absolute inset-4 rounded-full border border-white/20 [transform-style:preserve-3d]"
            >
              <div
                className="absolute bottom-0 right-1/2 w-2.5 h-2.5 -mr-1.25 -mb-1.25 rounded-full"
                style={{ backgroundColor: v.particles, boxShadow: `0 0 10px ${v.particles}` }}
              />
            </motion.div>

            {/* Inner Gyro Ring 3 (Diagonal orbit) */}
            <motion.div
              animate={{ rotateZ: 360, rotateX: -45, rotateY: 45 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-10 rounded-full border border-dotted border-white/30 [transform-style:preserve-3d]"
            />

            {/* Glowing 3D Quantum Vault Core */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], rotate: [0, 90, 180, 270, 360] }}
              transition={{
                scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 25, ease: 'linear' }
              }}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr ${v.orbCore} shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center justify-center p-1 relative z-20 backdrop-blur-md`}
            >
              <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center text-center p-3 border border-white/20">
                <Lock size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] mb-1" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/80">
                  ENCRYPTED
                </span>
              </div>
            </motion.div>
          </div>

          {/* Core Telemetry Tagline */}
          <div className="text-center mt-6 space-y-2 max-w-md">
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
              Hardware-Enforced Financial Privacy
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
              Bank statements parsed on-device in isolated sandbox memory. Zero cloud transmission, zero advertising telemetry.
            </p>
          </div>
        </div>

        {/* Bottom Hardware Telemetry Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">HSM_ENCLAVE_READY</span>
          </div>
          <div>CIPHER: AES-256-GCM / CHACHA20</div>
          <div className="hidden sm:inline">LOCAL_SQLITE_DECRYPTED_ON_FLY</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: MODERN SLEEK GLASS LOGIN / UNLOCK CARD     */}
      {/* ======================================================== */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-[2.5rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-9 relative overflow-hidden"
        >
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* User Profile Avatar / Session Badge */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base shadow-inner">
                RK
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm">Riya Kapoor</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs text-white/50 font-mono">Vault Session #4029</p>
              </div>
            </div>

            <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full border ${v.badge}`}>
              Locked
            </span>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mb-7 text-xs font-semibold">
            <button
              onClick={() => { setAuthMode('biometric'); setErrorMsg(''); }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ${
                authMode === 'biometric'
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Fingerprint size={15} />
              <span>Biometric</span>
            </button>
            <button
              onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ${
                authMode === 'pin'
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <KeyRound size={15} />
              <span>PIN</span>
            </button>
            <button
              onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ${
                authMode === 'password'
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Lock size={15} />
              <span>Password</span>
            </button>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 1: BIOMETRIC UNLOCK (Touch ID / Face ID)             */}
          {/* -------------------------------------------------------- */}
          {authMode === 'biometric' && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-6">
              <div
                onClick={handleBiometricScan}
                className="relative cursor-pointer group"
                title="Click to scan fingerprint / Passkey"
              >
                {/* Outer Ripple Rings */}
                <motion.div
                  animate={isScanning ? { scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-4 rounded-full border border-white/20"
                />

                {/* Main Fingerprint Button */}
                <div
                  className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                    scanSuccess
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                      : isScanning
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.5)]'
                      : 'border-white/20 bg-white/5 text-white/80 group-hover:border-white/40 group-hover:bg-white/10 group-hover:scale-105'
                  }`}
                >
                  {/* Laser Scanning Beam Line */}
                  {isScanning && (
                    <motion.div
                      animate={{ y: [-48, 48, -48] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#38bdf8] z-20"
                    />
                  )}

                  {scanSuccess ? (
                    <CheckCircle2 size={44} className="text-emerald-400" />
                  ) : (
                    <Fingerprint size={48} className="transition-transform group-hover:scale-110" />
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-base">
                  {scanSuccess
                    ? 'Vault Decrypted!'
                    : isScanning
                    ? 'Verifying Passkey Signature...'
                    : 'Touch ID / WebAuthn Passkey'}
                </h5>
                <p className="text-xs text-white/50 mt-1">
                  {scanSuccess
                    ? 'Opening Kitna Kharcha 2.0...'
                    : 'Touch your sensor or click to authenticate with local biometric enclave'}
                </p>
              </div>

              <button
                onClick={handleBiometricScan}
                disabled={isScanning || scanSuccess}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  v.button
                } hover:opacity-95 active:scale-[0.98] shadow-lg`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying Hardware Key...</span>
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={16} />
                    <span>Scan Fingerprint / Face ID</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 2: QUICK 6-DIGIT PIN                                 */}
          {/* -------------------------------------------------------- */}
          {authMode === 'pin' && (
            <div className="space-y-6">
              {/* PIN Dot Indicators */}
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                        filled
                          ? 'bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                          : 'border-white/20 bg-white/5'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Numpad 3x4 Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
                  const isAction = key === 'C' || key === '⌫';
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'C') setPin('');
                        else if (key === '⌫') handlePinDelete();
                        else handlePinPress(key);
                      }}
                      className={`h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-base transition-all duration-150 active:scale-90 ${
                        isAction
                          ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/5 shadow-sm'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* Demo Helper Button */}
              <div className="pt-1 text-center">
                <button
                  onClick={() => {
                    setPin('202609');
                    verifyPin('202609');
                  }}
                  className="text-xs text-white/40 hover:text-white/80 transition-colors underline underline-offset-4"
                >
                  Quick Fill Demo PIN (202609)
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 3: MASTER PASSWORD FORM                              */}
          {/* -------------------------------------------------------- */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">
                  Vault Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your cryptographic passphrase"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 text-sm text-white placeholder-white/30 outline-none pr-10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="rounded accent-white" />
                  <span>Remember on this hardware</span>
                </label>
                <span className="text-white/40 hover:text-white cursor-pointer">Forgot?</span>
              </div>

              <button
                type="submit"
                disabled={isScanning || scanSuccess}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  v.button
                } hover:opacity-95 active:scale-[0.98] shadow-lg mt-2`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Decrypting Database...</span>
                  </>
                ) : (
                  <>
                    <Unlock size={16} />
                    <span>Unlock Vault</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Bypass Button */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              onClick={onUnlock}
              className="text-xs font-semibold text-white/60 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors group"
            >
              <span>Skip directly to Live Dashboard</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
