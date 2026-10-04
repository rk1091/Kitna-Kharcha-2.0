import React, { useState } from 'react';
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
  ChevronRight,
  Mail,
  Chrome,
  Layers,
  Compass
} from 'lucide-react';

export default function LockScreen({ onUnlock }) {
  // Lock Screen Design Tabs:
  // 'design1': 3D Gyroscopic Rings Vault (Original Assistant Generation from c4ad888)
  // 'design2': Living 3D Morphing Organic Orb & Glassmorphism Card (from 20e122a)
  const [activeTab, setActiveTab] = useState('design1');

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black select-none font-sans text-white">
      
      {/* ======================================================== */}
      {/* FLOATING TOP DESIGN SELECTOR TABS                        */}
      {/* ======================================================== */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1 rounded-full bg-black/80 border border-white/20 backdrop-blur-2xl shadow-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('design1')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'design1'
              ? 'bg-white text-black font-bold shadow-lg scale-105'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Design 1: 3-Axis Gyroscopic Rings Vault with Cosmic/Cyber/Solar scenes"
        >
          <span>🪐</span>
          <span>Design 1: 3D Gyro Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('design2')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'design2'
              ? 'bg-white text-black font-bold shadow-lg scale-105'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Design 2: Living 3D Morphing Organic Orb with Glassmorphism Card"
        >
          <span>💎</span>
          <span>Design 2: Living Orb & Glass</span>
        </button>
      </div>

      {/* RENDER ACTIVE LOCK SCREEN DESIGN */}
      <AnimatePresence mode="wait">
        {activeTab === 'design1' ? (
          <motion.div
            key="tab1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            <LockScreenDesign1 onUnlock={onUnlock} />
          </motion.div>
        ) : (
          <motion.div
            key="tab2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            <LockScreenDesign2 onUnlock={onUnlock} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================================
// DESIGN 1: 3D GYROSCOPIC VAULT (ORIGINAL GENERATION FROM c4ad888)
// =========================================================================
function LockScreenDesign1({ onUnlock }) {
  const [authMode, setAuthMode] = useState('biometric'); // 'biometric' | 'pin' | 'password'
  const [visualMode, setVisualMode] = useState('cosmic'); // 'cosmic' | 'cyber' | 'solar'
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      {/* Background Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Visual Mode Selector Floating Pill */}
      <div className="absolute top-16 lg:top-6 left-6 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 flex items-center gap-1">
          <SlidersHorizontal size={11} /> Scene
        </span>
        {Object.keys(visuals).map((mode) => (
          <button
            key={mode}
            onClick={() => setVisualMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              visualMode === mode
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {visuals[mode].name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* --- LEFT COLUMN: 3D HOLOGRAPHIC VAULT & TELEMETRY --- */}
      <div className="w-full lg:w-7/12 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[460px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 z-10 overflow-hidden">
        
        {/* Top Header info */}
        <div className="pt-20 lg:pt-14 flex items-center gap-3">
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

      {/* --- RIGHT COLUMN: MODERN SLEEK GLASS LOGIN CARD --- */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 z-20 pt-16 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-[2.5rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-9 relative overflow-hidden"
        >
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
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
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
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
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
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
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

          {/* TAB 1: BIOMETRIC UNLOCK */}
          {authMode === 'biometric' && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-6">
              <div
                onClick={handleBiometricScan}
                className="relative cursor-pointer group"
                title="Click to scan fingerprint / Passkey"
              >
                <motion.div
                  animate={isScanning ? { scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-4 rounded-full border border-white/20"
                />

                <div
                  className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                    scanSuccess
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                      : isScanning
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.5)]'
                      : 'border-white/20 bg-white/5 text-white/80 group-hover:border-white/40 group-hover:bg-white/10 group-hover:scale-105'
                  }`}
                >
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
                <p className="text-sm font-semibold">
                  {scanSuccess
                    ? 'Identity Authenticated'
                    : isScanning
                    ? 'Scanning Touch ID Enclave...'
                    : 'Tap Fingerprint Sensor to Unlock'}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Biometrics matched locally via Secure Enclave
                </p>
              </div>

              <button
                onClick={handleBiometricScan}
                disabled={isScanning || scanSuccess}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${v.button}`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Unsealed</span>
                  </>
                ) : (
                  <>
                    <span>Simulate Touch ID Unlock</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: PIN CODE ENTRY */}
          {authMode === 'pin' && (
            <div className="space-y-6">
              <div className="flex justify-center items-center gap-3 py-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                      pin.length > i
                        ? 'bg-white border-white scale-110 shadow-[0_0_10px_white]'
                        : 'border-white/30 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinPress(num.toString())}
                    className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 font-semibold text-lg transition-all flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPin('')}
                  className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase text-white/50 transition-all flex items-center justify-center cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePinPress('0')}
                  className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 font-semibold text-lg transition-all flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handlePinDelete}
                  className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase text-white/50 transition-all flex items-center justify-center cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              <p className="text-[11px] text-center text-white/40 font-mono">
                Tip: Enter any 6 digits to unlock
              </p>
            </div>
          )}

          {/* TAB 3: MASTER PASSWORD ENTRY */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest ml-1 mb-2 block">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passphrase..."
                    className="w-full bg-white/5 border border-white/15 rounded-2xl py-3.5 pl-4 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isScanning || scanSuccess}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${v.button}`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Decrypting...</span>
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Unlocked</span>
                  </>
                ) : (
                  <>
                    <span>Decrypt & Open Vault</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span className="font-mono text-[10px]">AUTH_GATEWAY: 0x48FA</span>
            <button
              onClick={onUnlock}
              className="text-white/70 hover:text-white hover:underline text-[11px] flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Direct Dashboard ➔</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =========================================================================
// DESIGN 2: LIVING 3D MORPHING ORGANIC ORB & GLASS (FROM 20e122a)
// =========================================================================
function LockScreenDesign2({ onUnlock }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleUnseal = (e) => {
    if (e) e.preventDefault();
    if (isAuthenticating || authSuccess) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onUnlock) onUnlock();
      }, 600);
    }, 1000);
  };

  const handleBiometric = () => {
    if (isAuthenticating || authSuccess) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onUnlock) onUnlock();
      }, 500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden font-sans text-white">
      {/* --- LEFT SIDE: LIVING 3D ABSTRACT ORB --- */}
      <div className="relative w-full md:w-3/5 h-[45vh] md:h-screen bg-black flex flex-col items-center justify-center p-8 sm:p-12 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />
        
        {/* THE 3D ORB (Custom CSS/Motion Animation) */}
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96"
        >
          {/* Layer 1: Core Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-[80px] opacity-35 animate-pulse" />
          
          {/* Layer 2: Moving Glass Mesh */}
          <motion.div 
            animate={{ borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "40% 60% 70% 30%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl shadow-purple-500/20"
          />
          
          {/* Layer 3: Particle Accents */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full blur-md opacity-60 shadow-[0_0_20px_white]" />
        </motion.div>

        {/* LOGO & TAGLINE ON LEFT */}
        <div className="relative z-10 text-center mt-8 md:mt-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <ShieldCheck className="text-purple-400" size={36} />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Kitna Kharcha 2.0</h1>
          </motion.div>
          <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed font-light text-xs md:text-sm">
             Encryption-grade security for your financial soul. <br/>
             <span className="text-white/40 italic font-mono text-[10px] uppercase tracking-widest mt-2 block">
               Powered by Privacy-First LLM Engine
             </span>
          </p>
        </div>

        {/* Dynamic Grid Background Element */}
        <div 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)' }} 
           className="absolute bottom-0 w-full h-1/2 opacity-[0.05] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none"
        />
      </div>

      {/* --- RIGHT SIDE: HIGH-END GLASS LOGIN CARD --- */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 sm:p-10 bg-zinc-950 min-h-[55vh] md:min-h-screen pt-16 md:pt-10">
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* WELCOME MESSAGE */}
          <div className="mb-8 md:mb-10 text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Access Vault</h2>
            <p className="text-zinc-500 text-xs sm:text-sm">Provide biometrics or manual credentials.</p>
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleUnseal} className="space-y-5">
            <div className="relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">
                System Identifier
              </label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm text-white placeholder-zinc-600"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">
                Access Key
              </label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm text-white placeholder-zinc-600"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <motion.button 
              type="submit"
              disabled={isAuthenticating || authSuccess}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Vault Unsealed!</span>
                </>
              ) : (
                <>
                  <span>Unseal Data</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <div className="relative flex items-center justify-center py-2">
              <div className="w-full h-px bg-white/5" />
              <span className="absolute bg-zinc-950 px-4 text-xs font-bold text-zinc-600 tracking-wider">
                SECURE CONNECT
              </span>
            </div>

            {/* BIOMETRIC SIMULATION */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                type="button"
                onClick={handleBiometric}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-white cursor-pointer"
              >
                <Fingerprint size={18} className="text-purple-400" />
                <span className="text-xs font-bold tracking-tight">Biometrics</span>
              </button>
              <button 
                type="button"
                onClick={handleBiometric}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-white cursor-pointer"
              >
                <Chrome size={18} className="text-blue-400" />
                <span className="text-xs font-bold tracking-tight">SSO Key</span>
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-8 md:mt-12 flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-widest">
            <span>AES-256 GCM Mode</span>
            <button
              onClick={onUnlock}
              className="text-purple-400 hover:underline font-bold normal-case cursor-pointer"
            >
              Direct Dashboard ➔
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
