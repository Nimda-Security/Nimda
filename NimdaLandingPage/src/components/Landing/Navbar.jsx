'use client';
import { motion } from 'framer-motion';

export default function Navbar() {
  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 700; 
    let start = null;

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleScroll(e, '#home')}>
          <img src="/NimdaLogo_W.png" alt="NIMDA Logo" className="w-8 h-8 object-contain" />
        </div>
        
        <div className="hidden md:flex items-center gap-12 text-lg font-medium text-gray-400 font-['Pretendard']">
          <a href="#about" onClick={(e) => handleScroll(e, '#about')} className="hover:text-white transition-colors">소개</a>
          <a href="#awards" onClick={(e) => handleScroll(e, '#awards')} className="hover:text-white transition-colors">수상</a>
          <a href="#projects" onClick={(e) => handleScroll(e, '#projects')} className="hover:text-white transition-colors">추억</a>
          <a href="https://moaform.com/q/8e13lE" target="_blank" className="text-indigo-400 hover:text-indigo-300 transition-colors">지원하기</a>
        </div>
      </div>
    </motion.nav>
  );
}
