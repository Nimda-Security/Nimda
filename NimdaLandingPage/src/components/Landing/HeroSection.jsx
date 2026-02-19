'use client';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';

const Star = ({ style, delay }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={style}
    initial={{ opacity: 0.2, scale: 0.5 }}
    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.5, 1, 0.5] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

export default function HeroSection() {
  const [stars, setStars] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate random stars on the client side only to avoid hydration mismatch
    const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`, // 1px ~ 3px
        height: `${Math.random() * 2 + 1}px`,
      },
      delay: Math.random() * 5,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]" suppressHydrationWarning>
      
      {/* Starry Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && stars.map((star) => (
          <Star key={star.id} style={star.style} delay={star.delay} />
        ))}
      </div>

      {/* Background Marquee Text */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full opacity-5 pointer-events-none select-none overflow-hidden z-0">
         <motion.div 
           className="whitespace-nowrap text-[20vw] font-black text-white leading-none"
           animate={{ x: ["0%", "-50%"] }}
           transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
         >
           NETWORK WEB SYSTEM FORENSIC CRYPTO NETWORK WEB SYSTEM FORENSIC CRYPTO
         </motion.div>
      </div>

      {/* Main Content Container - Simpler Layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-[1600px] mx-auto gap-2 md:gap-4">
        
        {/* Left Text: NIMDA */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[18vw] md:text-[13vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-gray-600 relative z-20 text-center md:text-right select-none"
        >
          NIMDA
        </motion.h1>

        {/* Right Text: SECURITY */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="text-[18vw] md:text-[13vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-gray-600 relative z-20 text-center md:text-left select-none"
        >
          SECURITY
        </motion.h1>

      </div>
      
      <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-12 md:bottom-24 text-gray-400 text-sm md:text-lg font-mono tracking-[0.5em] uppercase z-40 text-center w-full px-4"
        >
          KNU Cyber Security Club
      </motion.p>
      
      {/* Decorative Gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/20 via-transparent to-transparent pointer-events-none z-0" />
    </div>
  );
}
