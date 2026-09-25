import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cat, Snowflake } from 'lucide-react';

export default function Interactive3DBackground({ mode = '3d-gyro', theme = 'cozy' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. 3D GYROSCOPIC HOLOGRAPHIC VAULT RINGS */}
      {mode === '3d-gyro' && (
        <div
          className="absolute inset-0 flex items-center justify-center [perspective:1200px]"
          style={{
            transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Ambient center radial glow */}
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 bg-current pointer-events-none" />

          {/* 3D Gyro Ring Outer */}
          <motion.div
            animate={{ rotateZ: 360, rotateX: 68 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute w-[550px] h-[550px] rounded-full border border-dashed border-white/10 [transform-style:preserve-3d]"
          >
            <div className="absolute top-0 left-1/2 w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full bg-white shadow-[0_0_15px_#fff]" />
          </motion.div>

          {/* 3D Gyro Ring Mid */}
          <motion.div
            animate={{ rotateZ: -360, rotateY: 72 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="absolute w-[420px] h-[420px] rounded-full border border-white/15 [transform-style:preserve-3d]"
          >
            <div className="absolute bottom-0 right-1/2 w-2.5 h-2.5 -mr-1.25 -mb-1.25 rounded-full bg-yellow-400 shadow-[0_0_12px_#fbbf24]" />
          </motion.div>

          {/* 3D Gyro Ring Inner */}
          <motion.div
            animate={{ rotateZ: 360, rotateX: -45, rotateY: 55 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            className="absolute w-[300px] h-[300px] rounded-full border border-dotted border-white/20 [transform-style:preserve-3d]"
          />
        </div>
      )}

      {/* 2. 3D CYBER MATRIX WIREFRAME WAVES */}
      {mode === '3d-matrix' && (
        <div
          className="absolute inset-0 [perspective:800px] opacity-25"
          style={{
            transform: `rotateX(45deg) translateY(${mousePos.y * 20}px) translateX(${mousePos.x * 20}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <div className="w-[200%] h-[200%] -ml-[50%] -mt-[20%] bg-[linear-gradient(to_right,#10b98125_1px,transparent_1px),linear-gradient(to_bottom,#10b98125_1px,transparent_1px)] [background-size:48px_48px] animate-pulse" />
        </div>
      )}

      {/* 3. STARRY NIGHT FALLING STARS */}
      {mode === 'stars' && (
        <div className="absolute inset-0">
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
          {/* Subtle floating stardust */}
          {[...Array(35)].map((_, i) => (
            <div
              key={`star-dust-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                top: `${(i * 29) % 100}%`,
                left: `${(i * 31) % 100}%`,
                opacity: 0.15 + (i % 4) * 0.15,
                animation: `pulse ${(i % 4) + 2}s infinite`
              }}
            />
          ))}
        </div>
      )}

      {/* 4. NEKO FLOATING CATS */}
      {mode === 'cats' && (
        <div className="absolute inset-0 opacity-20">
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

      {/* 5. COZY FALLING SNOW */}
      {mode === 'snow' && (
        <div className="absolute inset-0 opacity-35">
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
    </div>
  );
}
