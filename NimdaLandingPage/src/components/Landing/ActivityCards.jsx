'use client';
import { motion } from 'framer-motion';
import { Code, Shield, Terminal, Globe, Award, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const Card = ({ children, className, delay = 0 }) => (
  <ScrollReveal
    delay={delay}
    className={`glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </ScrollReveal>
);

export default function ActivityCards() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Beyond <span className="text-indigo-400">Security</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            NIMDA는 단순한 스터디를 넘어, 실제 해킹 대회와 프로젝트를 통해 성장합니다.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
        {/* Main Card - Big */}
        <Card className="md:col-span-2 md:row-span-2 flex flex-col justify-between bg-gradient-to-br from-gray-900 to-black">
          <div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Hands-on Security</h3>
            <p className="text-gray-400 text-lg">
              웹 해킹, 시스템 해킹, 리버싱 등 다양한 분야의 보안 기술을 실습을 통해 학습합니다.
              자체 CTF 개최와 외부 대회 참여로 실전 감각을 키웁니다.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <Globe className="w-5 h-5 text-blue-400 mb-2" />
              <div className="font-bold text-white">Web Hacking</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <Shield className="w-5 h-5 text-purple-400 mb-2" />
              <div className="font-bold text-white">System Security</div>
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card delay={0.2} className="flex flex-col items-center justify-center text-center">
          <Users className="w-10 h-10 text-blue-400 mb-4" />
          <div className="text-4xl font-bold text-white mb-1">50+</div>
          <div className="text-sm text-gray-500 uppercase tracking-widest">Active Members</div>
        </Card>

        {/* Award Card */}
        <Card delay={0.4} className="flex flex-col justify-center">
          <Award className="w-10 h-10 text-yellow-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Winning Awards</h3>
          <p className="text-sm text-gray-400">
            K-Cyber Security Challenge, UCPC 등 다수 대회 수상 기록 보유
          </p>
        </Card>

        {/* Coding Card */}
        <Card delay={0.6} className="md:col-span-1 bg-[#111]">
          <Code className="w-10 h-10 text-pink-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Dev & Algo</h3>
          <p className="text-sm text-gray-400">
            보안뿐만 아니라 기초 프로그래밍과 알고리즘 역량 강화 활동 병행
          </p>
        </Card>
      </div>
    </section>
  );
}
