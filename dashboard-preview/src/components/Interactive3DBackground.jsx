import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cat, Snowflake } from 'lucide-react';

export default function Interactive3DBackground({ theme = 'cozy' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Theme-locked atmospheric worlds (NO CROSS-POLLUTION)
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 1. COZY HEARTH: Warm Hearth Glow & Paper Texture */}
      {theme === 'cozy' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(#800000_0.75px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div
            className="absolute -right-20 -bottom-20 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 bg-[#800000] pointer-events-none transition-transform duration-500"
            style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
          />
        </div>
      )}

      {/* 2. CHRISTMAS MORNING: Falling Festive Snowflakes */}
      {theme === 'christmas' && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              initial={{ top: -20, left: `${(i * 11) % 100}%` }}
              animate={{
                top: '110%',
                x: [0, 15, -15, 0]
              }}
              transition={{
                duration: 4.5 + (i % 4),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: (i * 0.7) % 7
              }}
              className="absolute text-white"
            >
              <Snowflake size={15 + (i % 3) * 6} />
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. STARRY NIGHT: Falling Shooting Stars & Constellation */}
      {theme === 'starry' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_1px)] [background-size:28px_28px] opacity-20" />
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`star-shooting-${i}`}
              initial={{ top: -20, left: `${(i * 17) % 100}%` }}
              animate={{
                top: '115%',
                left: `${((i * 17) % 100) - 20}%`,
                opacity: [0, 0.9, 0]
              }}
              transition={{
                duration: 2.8 + (i % 3),
                repeat: Infinity,
                ease: 'linear',
                delay: (i * 1.6) % 10
              }}
              className="absolute w-[2px] h-14 bg-gradient-to-t from-yellow-300 via-indigo-300 to-transparent -rotate-45"
            />
          ))}
        </div>
      )}

      {/* 4. NEKO KAWAII: Floating Cute Cat Silhouettes (ONLY for Neko) */}
      {(theme === 'neko' || theme === 'nekoPastel') && (
        <div className="absolute inset-0 opacity-15">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`cat-${i}`}
              animate={{
                y: [0, -35, 0],
                x: [0, (i % 2 === 0 ? 20 : -20), 0],
                rotate: [0, (i % 2 === 0 ? 12 : -12), 0]
              }}
              transition={{
                duration: 9 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute text-purple-200"
              style={{
                top: `${12 + i * 18}%`,
                left: `${10 + i * 18}%`
              }}
            >
              <Cat size={130 + (i % 2) * 40} />
            </motion.div>
          ))}
        </div>
      )}

      {/* 5. STEALTH MATRIX / CYBERPUNK: High-tech Scanlines */}
      {(theme === 'stealth' || theme === 'cyberpunk') && (
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] [background-size:32px_32px]" />
      )}

      {/* 6. MIDNIGHT NAVY / OCEAN: 3D Holographic Vault Orbit */}
      {(theme === 'midnight' || theme === 'ocean' || theme === 'cyberPurple') && (
        <div
          className="absolute inset-0 flex items-center justify-center [perspective:1000px]"
          style={{
            transform: `rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <div className="absolute w-[480px] h-[480px] rounded-full blur-[140px] opacity-20 bg-current pointer-events-none" />
          <motion.div
            animate={{ rotateZ: 360, rotateX: 68 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-white/10 [transform-style:preserve-3d]"
          />
          <motion.div
            animate={{ rotateZ: -360, rotateY: 72 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="absolute w-[380px] h-[380px] rounded-full border border-white/15 [transform-style:preserve-3d]"
          />
        </div>
      )}

      {/* 7. SOLAR / NORDIC / PAPER: Clean Crisp Daylight (Zero Clutter) */}
      {(theme === 'solar' || theme === 'nordic' || theme === 'paper') && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02]" />
      )}
    </div>
  );
}
