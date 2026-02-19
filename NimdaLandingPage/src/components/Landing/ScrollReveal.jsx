'use client';
import { motion } from 'framer-motion';

export default function ScrollReveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} // "Eased" feel
      className={className}
    >
      {children}
    </motion.div>
  );
}
