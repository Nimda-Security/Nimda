'use client';
import { createStars } from './starfield';
import { motion } from 'framer-motion';

const Star = ({ style, delay }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={style}
    initial={{ opacity: 0.1, scale: 0.5 }}
    animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.5, 1, 0.5] }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const BACKGROUND_STARS = createStars(30, 0x53454355);

export default function StarBackground() {

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-screen w-full">
      {BACKGROUND_STARS.map((star) => (
        <Star key={star.id} style={star.style} delay={star.delay} />
      ))}
    </div>
  );
}
