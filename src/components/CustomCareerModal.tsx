'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerOption, saveCustomCareer, CAREER_CATEGORIES } from '@/lib/careers';

interface CustomCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (career: CareerOption) => void;
  initialCareerName?: string;
}

const EMOJI_OPTIONS = [
  // Professional emojis
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔧', '👩‍🔧', '🧑‍🔧',
  '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️',
  '👨‍🚒', '👩‍🚒', '🧑‍🚒', '👨‍✈️', '👩‍✈️', '🧑‍✈️',
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🍳', '👩‍🍳', '🧑‍🍳',
  '👨‍🌾', '👩‍🌾', '🧑‍🌾', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️',
  
  // Tool and object emojis
  '⚕️', '🔬', '💻', '🎨', '📚', '✏️', '🔧', '⚖️',
  '🍳', '🎵', '📸', '🎬', '🏆', '💡', '🌱', '🔥',
  '🚀', '⭐', '💎', '🎪', '🎭', '🎤', '🎸', '🎲',
  '⚽', '🏀', '🎾', '🏊‍♀️', '🚴‍♂️', '🧘‍♀️', '💪', '🏋️‍♀️'
];

export default function CustomCareerModal({ isOpen, onClose, onAdd, initialCareerName = '' }: CustomCareerModalProps) {
  const [careerName, setCareerName] = useState(initialCareerName);
  const [selectedEmoji, setSelectedEmoji] = useState('👨‍💼');
  const [selectedCategory, setSelectedCategory] = useState(CAREER_CATEGORIES.BUSINESS);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { name?: string } = {};
    if (!careerName.trim()) {
      newErrors.name = 'Please enter a career name';
    } else if (careerName.trim().length < 2) {
      newErrors.name = 'Career name must be at least 2 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newCareer: CareerOption = {
      value: `custom-${Date.now()}`,
      label: careerName.trim(),
      emoji: selectedEmoji,
      category: selectedCategory,
      isCustom: true
    };

    // Save to localStorage
    saveCustomCareer(newCareer);
    
    // Add to parent component
    onAdd(newCareer);
    
    // Reset form
    setCareerName('');
    setSelectedEmoji('👨‍💼');
    setSelectedCategory(CAREER_CATEGORIES.BUSINESS);
    setErrors({});
    
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Add Custom Career ✨
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Career Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Name
                </label>
                <input
                  type="text"
                  value={careerName}
                  onChange={(e) => {
                    setCareerName(e.target.value);
                    setErrors({});
                  }}
                  placeholder="e.g., Video Game Tester, Pet Trainer, Space Explorer"
                  className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
                    errors.name ? 'border-red-400' : 'border-gray-200'
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {careerName.length}/50 characters
                </p>
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose an Emoji
                </label>
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                  {EMOJI_OPTIONS.map((emoji, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`p-2 text-xl rounded-lg transition-all duration-200 ${
                        selectedEmoji === emoji
                          ? 'bg-purple-500 shadow-md'
                          : 'hover:bg-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                >
                  {Object.values(CAREER_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedEmoji}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {careerName || 'Your Career Name'}
                    </div>
                    <div className="text-xs text-gray-500">{selectedCategory}</div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={!careerName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: careerName.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: careerName.trim() ? 0.98 : 1 }}
                >
                  Add Career
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}