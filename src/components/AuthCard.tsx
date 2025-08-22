'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { validateCredentials, setAuthSession, AuthCredentials } from '@/lib/auth';

interface AuthCardProps {
  onSuccess: (firstLogin: boolean) => void;
}

export default function AuthCard({ onSuccess }: AuthCardProps) {
  const [credentials, setCredentials] = useState<AuthCredentials>({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (validateCredentials(credentials)) {
      const isFirstTime = !localStorage.getItem('dreamBigLoginTime');
      setAuthSession(true);
      onSuccess(isFirstTime);
    } else {
      setError('Oops! Wrong credentials, young hero!');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof AuthCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        x: shake ? [-10, 10, -10, 10, 0] : 0
      }}
      transition={{ 
        duration: 0.5,
        x: shake ? { duration: 0.6 } : {}
      }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🦸‍♂️</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Hero Login
        </h2>
        <p className="text-gray-600">
          Enter your superhero credentials to start building Singapore!
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Name
          </label>
          <input
            id="username"
            type="text"
            value={credentials.username}
            onChange={handleInputChange('username')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            placeholder="Enter your hero name..."
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Secret Code
          </label>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={handleInputChange('password')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            placeholder="Enter your secret code..."
            required
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center"
          >
            <span className="text-2xl mr-2">😅</span>
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Verifying Hero Status...</span>
            </div>
          ) : (
            <span>Start My Adventure! 🚀</span>
          )}
        </motion.button>
      </form>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
          <div className="font-medium mb-1">🔐 Demo Credentials</div>
          <div>Hero Name: <span className="font-mono bg-white px-2 py-1 rounded">superkid</span></div>
          <div>Secret Code: <span className="font-mono bg-white px-2 py-1 rounded">buildSG</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}