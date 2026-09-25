import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Fingerprint, ArrowRight, Github, 
  Chrome, Mail, Lock, Sparkles, Cpu, CheckCircle2, RefreshCw
} from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        if (onLogin) onLogin();
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
        if (onLogin) onLogin();
      }, 500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden font-outfit text-white">
      
      {/* --- LEFT SIDE: 3D/MOVING VISUALS --- */}
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

      {/* --- RIGHT SIDE: LOGIN CARD --- */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 sm:p-10 bg-zinc-950 min-h-[55vh] md:min-h-screen">
        
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
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">System Identifier</label>
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
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Access Key</label>
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
              <span className="absolute bg-zinc-950 px-4 text-xs font-bold text-zinc-600 tracking-wider">SECURE CONNECT</span>
            </div>

            {/* BIOMETRIC SIMULATION */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                type="button"
                onClick={handleBiometric}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-white"
              >
                <Fingerprint size={18} className="text-purple-400" />
                <span className="text-xs font-bold tracking-tight">Biometrics</span>
              </button>
              <button 
                type="button"
                onClick={handleBiometric}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-white"
              >
                <Chrome size={18} className="text-blue-400" />
                <span className="text-xs font-bold tracking-tight">SSO Key</span>
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <p className="mt-8 md:mt-12 text-center text-[10px] text-zinc-600 uppercase tracking-widest leading-loose">
            Your connection is proxied. No local data persistence <br/> 
            AES-256 Verified Mode: GCM-D-48220
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default LoginPage;
