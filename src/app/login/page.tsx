'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoginCarousel from '@/components/LoginCarousel';
import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuthenticated } = useAppStore();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLoginSuccess = (firstLogin: boolean) => {
    setAuthenticated(true, firstLogin);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Carousel */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <LoginCarousel />
        
        {/* Overlay gradient for better card visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        
        {/* Floating Singapore Flags on Carousel Side */}
        <motion.div
          className="absolute top-16 left-10 text-3xl"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0],
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          🇸🇬
        </motion.div>

        <motion.div
          className="absolute bottom-24 left-16 text-2xl"
          animate={{ 
            x: [0, 12, 0],
            y: [0, -8, 0],
            opacity: [0.8, 1, 0.8],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          🇸🇬
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-5 text-3xl"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 12, -12, 0],
            scale: [0.9, 1.2, 0.9]
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        >
          🇸🇬
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-bl from-orange-400 via-red-400 to-pink-500 p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-lg"
        >
          <AuthCard onSuccess={handleLoginSuccess} />
        </motion.div>

        {/* Animated Partner Logos - Smooth Visible Movement */}
        
        {/* Google Logo - Moving in Top Right Area */}
        <motion.div
          className="absolute top-16 right-16 md:top-20 md:right-20"
          animate={{ 
            x: [0, 30, 0, -20, 0],
            y: [0, -20, 0, 15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="/images/google-big.png" 
            alt="Google" 
            className="w-24 md:w-32 h-auto object-contain opacity-75 drop-shadow-xl"
          />
        </motion.div>

        {/* NCS Logo - Moving in Bottom Left Area */}
        <motion.div
          className="absolute bottom-20 left-16 md:bottom-24 md:left-20"
          animate={{ 
            x: [0, 25, 0, -15, 0],
            y: [0, -15, 0, 20, 0],
            rotate: [0, -4, 4, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <img 
            src="/images/ncs-logo-big.png" 
            alt="NCS" 
            className="w-28 md:w-36 h-auto object-contain opacity-75 drop-shadow-xl"
          />
        </motion.div>

        {/* Big Heart Student Care - Moving in Top Left Area */}
        <motion.div
          className="absolute top-24 left-12 md:top-32 md:left-16"
          animate={{ 
            x: [0, 20, 0, -25, 0],
            y: [0, -25, 0, 15, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        >
          <img 
            src="/images/big-heart-student-care-big.png" 
            alt="Big Heart Student Care" 
            className="w-32 md:w-40 h-auto object-contain opacity-70 drop-shadow-xl"
          />
        </motion.div>

        {/* Additional Google Logo - Bottom Right (floating) */}
        <motion.div
          className="absolute bottom-32 right-20 md:bottom-40 md:right-24 hidden lg:block"
          animate={{ 
            x: [0, -20, 0, 15, 0],
            y: [0, 20, 0, -15, 0],
            rotate: [0, -6, 6, 0],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        >
          <img 
            src="/images/google-big.png" 
            alt="Google" 
            className="w-20 md:w-24 h-auto object-contain opacity-60 drop-shadow-lg"
          />
        </motion.div>

        {/* Additional NCS Logo - Middle Right (drifting) */}
        <motion.div
          className="absolute top-1/2 right-12 hidden xl:block"
          animate={{ 
            x: [0, -30, 0, 20, 0],
            y: [0, -20, 0, 25, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
        >
          <img 
            src="/images/ncs-logo-big.png" 
            alt="NCS" 
            className="w-24 h-auto object-contain opacity-55 drop-shadow-lg"
          />
        </motion.div>

        {/* Floating particles with visible movement */}
        <motion.div
          className="absolute top-1/3 right-1/3 text-lg"
          animate={{ 
            x: [0, 15, 0, -10, 0],
            y: [0, -10, 0, 15, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        >
          ✨
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-1/3 text-md"
          animate={{ 
            x: [0, -20, 0, 15, 0],
            y: [0, 15, 0, -20, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7
          }}
        >
          ⭐
        </motion.div>
      </div>

      {/* Built with Love by NCS - Jumping Element */}
      <motion.div
        className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50"
        initial={{ y: 100, opacity: 0, scale: 0.5 }}
        animate={{ 
          y: [100, 0, -20, 0],
          opacity: [0, 1, 1, 1],
          scale: [0.5, 1.1, 1, 1]
        }}
        transition={{
          duration: 1.5,
          delay: 2,
          ease: "easeOut"
        }}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-3 md:p-4 flex items-center gap-2 md:gap-3 cursor-pointer hover:shadow-3xl transition-shadow"
          animate={{ 
            y: [0, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3.5
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3.5
            }}
          >
            <span className="text-2xl">❤️</span>
          </motion.div>
          
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-gray-600 font-medium">Built with love by</span>
            <div className="flex items-center gap-2">
              <img 
                src="/images/ncs.jpg" 
                alt="NCS Logo" 
                className="h-6 md:h-8 w-auto object-contain"
              />
              <span className="font-bold text-base md:text-lg text-gray-800">NCS</span>
            </div>
          </div>

          {/* Sparkle effects around the element */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="absolute -bottom-2 -left-2 text-yellow-400 text-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4.5
            }}
          >
            ✨
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          .flex {
            flex-direction: column;
          }
          .flex-1:first-child {
            height: 50vh;
          }
          .flex-1:last-child {
            height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}