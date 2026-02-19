'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const AWARDS = [
  { year: "2020", title: "K-사이버 시큐리티 챌린지", desc: "충청권 지역예선 1위" },
  { year: "2024", title: "프로보노 ICT멘토링 공모전", desc: "입선" },
];

export function AwardsSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <ScrollReveal>
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Achievements</h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AWARDS.map((award, i) => (
          <ScrollReveal key={i} delay={i * 0.1} className="border-l-2 border-indigo-500 pl-6 py-2">
            <span className="text-indigo-400 font-mono text-sm">{award.year}</span>
            <h3 className="text-xl font-bold text-white mt-1">{award.title}</h3>
            <p className="text-gray-500 text-sm">{award.desc}</p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const [showToast, setShowToast] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('nimda0410@gmail.com');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <footer className="pt-12 pb-32 bg-[#050505] text-center relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-32 left-1/2 z-[100] px-6 py-3 bg-neutral-900 border border-indigo-500/30 text-indigo-400 font-bold rounded-full shadow-2xl shadow-indigo-900/20 whitespace-nowrap"
          >
            메일 주소가 복사되었습니다.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center mb-2">
          <img src="/NimdaLogo_W.png" alt="Logo" className="w-8 h-8 object-contain opacity-80" />
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} NIMDA Security Club. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <button 
            onClick={handleCopyEmail}
            className="hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
