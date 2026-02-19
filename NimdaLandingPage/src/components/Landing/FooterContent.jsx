'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const AWARDS = [
  { year: "2020", title: "K-Cyber Security Challenge", desc: "AI 악성코드 탐지대회 충청권 1등" },
  { year: "2024", title: "HackTheon Sejong", desc: "대학생 사이버 보안 경진 대회 출전" },
  { year: "2024", title: "ICPC Korea Regional", desc: "님다시큐리티 공주대 5팀 출전" },
  { year: "2024", title: "프로보노 ICT 공모전 대회", desc: "입선" },
];

export function AwardsSection() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <ScrollReveal className="mb-20 border-l-4 border-indigo-500 pl-6">
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">Award History</h2>
        <p className="text-gray-500 text-lg">우리의 도전과 성취의 기록들</p>
      </ScrollReveal>

      <div className="flex flex-col gap-8">
        {AWARDS.map((award, i) => (
          <ScrollReveal key={i} delay={i * 0.1} className="group border-b border-white/10 pb-8 hover:border-white/30 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
              <span className="text-indigo-400 font-mono text-xl font-bold tracking-wider shrink-0 w-24 md:pt-1">{award.year}</span>
              <div className="flex flex-col">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:pl-2 transition-all duration-300">{award.title}</h3>
                <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed group-hover:pl-2 transition-all duration-300 delay-75">{award.desc}</p>
              </div>
            </div>
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
