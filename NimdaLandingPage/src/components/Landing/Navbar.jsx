'use client';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img src="/NimdaLogo_W.png" alt="NIMDA Logo" className="w-8 h-8 object-contain" />
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#activities" className="hover:text-white transition-colors">Activities</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="https://moaform.com/q/8e13lE" target="_blank" className="text-indigo-400 hover:text-indigo-300 transition-colors">Apply</a>
        </div>
      </div>
    </motion.nav>
  );
}
