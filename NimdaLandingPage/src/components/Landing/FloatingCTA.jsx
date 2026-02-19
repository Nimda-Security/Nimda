'use client';
import { motion } from 'framer-motion';

export default function FloatingCTA() {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.a
        href="https://moaform.com/q/8e13lE"
        target="_blank"
        rel="noreferrer"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="pointer-events-auto group relative flex items-center justify-center gap-3 px-16 py-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
      >
        <span className="text-lg font-bold text-white tracking-tight transition-all duration-300">
          NIMDA 신입 부원 지원하기
        </span>
        
      </motion.a>
    </div>
  );
}
