'use client';
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const ACTIVITIES = [
  { date: "03 ~ 05", title: "멘토링 & 스터디", desc: "프로그래밍 언어와 알고리즘의 기초 과정 스터디를 진행했습니다.", img: "/mento.png" },
  { date: "06", title: "UCPC 참가", desc: "총 3개의 팀으로 UCPC에 참가했습니다.", img: "/UCPC.jpg" },
  { date: "08", title: "여름 MT", desc: "시원한 바다에서 함께 즐거운 추억을 쌓았습니다.", img: "/nimda_MT.jpg" },
  { date: "08 ~ 09", title: "하계 스터디", desc: "하계 방학 알고리즘 스터디를 진행했습니다.", img: "/Algorithm_study.jpg" },
  { date: "10", title: "ICPC 참가", desc: "총 5개의 팀으로 ICPC에 참가했습니다.", img: "/icpc.jpeg" },
  { date: "11", title: "NIMDA CON", desc: "첫 동아리 자체 대회를 개최하여 그동안 쌓아온 실력을 발휘하였습니다.", img: "/activity_nimdacon.jpg" },
];

const marqueeList = [...ACTIVITIES, ...ACTIVITIES];

export default function TimelineSection() {
  return (
    <section id="activities" className="py-24 overflow-hidden relative">
      <div className="max-w-[1200px] mx-auto px-6 mb-16">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
            2025 Timeline
          </h2>
        </ScrollReveal>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: "-50%" }}
          transition={{
            ease: "linear",
            duration: 40,
            repeat: Infinity,
          }}
          style={{ width: "max-content" }}
        >
          {marqueeList.map((act, i) => (
            <div
              key={i}
              className="relative h-[400px] w-[300px] flex-shrink-0 rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500"
            >
              {/* Image Background */}
              <div className="absolute inset-0">
                <img 
                  src={act.img} 
                  alt={act.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 p-8 w-full z-10">

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {act.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed drop-shadow-md">
                  {act.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
