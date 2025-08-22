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

        {/* Decorative elements */}
        <motion.div
          className="absolute top-10 right-10 text-4xl"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🏙️
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-20 text-3xl"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          🌟
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-5 text-2xl"
          animate={{ 
            x: [0, 10, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          ✨
        </motion.div>
      </div>

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