'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon?: string;
  duration?: number;
  onClose: (id: string) => void;
}

interface SparkleProps {
  delay: number;
  x: number;
  y: number;
}

const Sparkle = ({ delay, x, y }: SparkleProps) => (
  <motion.div
    className="absolute text-yellow-400 text-sm pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 0], 
      opacity: [0, 1, 0],
      rotate: [0, 180, 360] 
    }}
    transition={{ 
      duration: 1.5, 
      delay,
      ease: "easeOut"
    }}
  >
    ✨
  </motion.div>
);

export default function ToastNotification({ 
  id, 
  message, 
  type, 
  icon = '🎉', 
  duration = 4000, 
  onClose 
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    
    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 via-purple-500 to-pink-500';
      case 'error':
        return 'from-red-500 via-orange-500 to-pink-500';
      case 'info':
        return 'from-blue-500 via-purple-500 to-pink-500';
      default:
        return 'from-purple-500 via-pink-500 to-orange-500';
    }
  };

  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    delay: i * 0.2,
    x: Math.random() * 300,
    y: Math.random() * 80,
  }));

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        mass: 1 
      }}
      className="relative"
    >
      {/* Toast Container */}
      <div className={`bg-gradient-to-r ${getTypeStyles()} p-1 rounded-2xl shadow-2xl max-w-md mx-auto`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 relative overflow-hidden">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="text-3xl flex-shrink-0"
          >
            {icon}
          </motion.div>
          
          {/* Message */}
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-800 font-semibold text-sm md:text-base"
            >
              {message}
            </motion.p>
          </div>

          {/* Close Button */}
          <motion.button
            onClick={() => onClose(id)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        
        {/* Progress Bar */}
        <motion.div 
          className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-b-xl"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      {/* Sparkle Effects */}
      {type === 'success' && sparkles.map((sparkle, index) => (
        <Sparkle 
          key={index} 
          delay={sparkle.delay} 
          x={sparkle.x} 
          y={sparkle.y} 
        />
      ))}
      
      {/* Glow Effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getTypeStyles()} opacity-20 blur-xl rounded-2xl -z-10`}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  );
}