'use client';
import { useEffect, useState } from 'react';
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

export default function StarBackground() {
  const [stars, setStars] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate fewer stars for a sparse effect (30 stars)
    const generatedStars = Array.from({ length: 30 }).map((_, i) => ({
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

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-screen w-full">
      {stars.map((star) => (
        <Star key={star.id} style={star.style} delay={star.delay} />
      ))}
    </div>
  );
}
