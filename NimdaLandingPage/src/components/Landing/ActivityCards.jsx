'use client';
import { motion } from 'framer-motion';
import { Code, Shield, Terminal, Globe, Award, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ActivityItem = ({ num, title, subtitle, desc, delay = 0 }) => (
  <ScrollReveal delay={delay} className="w-full">
    <div className="group relative border-t border-white/10 hover:border-white/40 transition-colors duration-500 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start gap-8">
      
      {/* Number & Title Group */}
      <div className="flex flex-col md:w-1/2">
        <span className="text-xl font-mono text-indigo-500 mb-4 block">
          {num} — {subtitle}
        </span>
        <h3 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-none group-hover:translate-x-4 transition-transform duration-500 ease-out">
          {title}
        </h3>
      </div>

      {/* Description */}
      <div className="md:w-1/3 md:pt-14 relative">
        {/* Animated Line */}
        <div className="absolute top-0 left-0 w-12 h-[2px] bg-indigo-500 mb-6 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        
        <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {desc}
        </p>

        {/* Hover Arrow */}
        <div className="mt-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-indigo-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

    </div>
  </ScrollReveal>
);

export default function ActivityCards() {
  return (
    <section id="about" className="py-32 px-6">
      
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-24 px-4 border-b border-white/10 pb-8 flex justify-between items-end">
          <ScrollReveal>
            <h2 className="text-sm font-bold tracking-[0.2em] text-white/60 uppercase">
              Our Core Structure
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-right text-white/40 text-sm font-mono hidden md:block">
              NIMDA SECURITY <br /> EST. 2017
            </p>
          </ScrollReveal>
        </div>

        {/* List Layout */}
        <div className="flex flex-col">
          <ActivityItem 
            delay={0.1}
            num="01"
            title="Learn"
            subtitle="Foundation"
            desc="C, JAVA, 웹 개발, 정보보안, 알고리즘 등 다양한 주제의 스터디와 멘토링을 통해 탄탄한 기본기를 함께 다집니다."
          />
          <ActivityItem 
            delay={0.2}
            num="02"
            title="Challenge"
            subtitle="Expansion"
            desc="ICPC, UCPC 대회 참여부터 동아리 자체 대회 개최까지. 한계 없는 도전을 이어갑니다."
          />
          <ActivityItem 
            delay={0.3}
            num="03"
            title="Apply"
            subtitle="Execution"
            desc="실제 웹 개발 참여, 워게임 풀이, 취약점 분석 등 배운 지식을 현실의 문제 해결에 직접 응용합니다."
          />
          {/* Decorative Bottom Border */}
          <div className="w-full h-[1px] bg-white/10" />
        </div>
      </div>

    </section>
  );
}
