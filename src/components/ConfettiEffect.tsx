'use client';

import { motion } from 'framer-motion';

interface ConfettiEffectProps {
  show: boolean;
}

export default function ConfettiEffect({ show }: ConfettiEffectProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
          }}
          initial={{ y: -50, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: 0,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: 'easeOut',
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '🎈', '🦸‍♂️', '🦸‍♀️'][Math.floor(Math.random() * 7)]}
        </motion.div>
      ))}
    </div>
  );
}