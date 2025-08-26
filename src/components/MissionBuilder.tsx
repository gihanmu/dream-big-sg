'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_OPTIONS, WHO_WHAT_OPTIONS, POWER_OPTIONS, MissionOption } from '@/lib/missionOptions';

interface MissionBuilderProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function MissionBuilder({ value, onChange, error }: MissionBuilderProps) {
  const [selectedAction, setSelectedAction] = useState<MissionOption | null>(null);
  const [selectedWho, setSelectedWho] = useState<MissionOption | null>(null);
  const [selectedPower, setSelectedPower] = useState<MissionOption | null>(null);
  const [customText, setCustomText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Action, 1: Who/What, 2: Power

  const slides = [
    {
      title: 'Pick an Action',
      options: ACTION_OPTIONS,
      selected: selectedAction,
      onSelect: setSelectedAction,
      color: 'red'
    },
    {
      title: 'Pick Who/What',
      options: WHO_WHAT_OPTIONS,
      selected: selectedWho,
      onSelect: setSelectedWho,
      color: 'blue'
    },
    {
      title: 'Pick a Power',
      options: POWER_OPTIONS,
      selected: selectedPower,
      onSelect: setSelectedPower,
      color: 'green'
    }
  ];

  const currentSlideData = slides[currentSlide];

  useEffect(() => {
    if (selectedAction || selectedWho || selectedPower) {
      const builtSentence = `I will ${selectedAction ? selectedAction.label : '[Action]'} my ${selectedWho ? selectedWho.label : '[Who/What]'} with ${selectedPower ? selectedPower.label : '[Power]'}.`;
      onChange(builtSentence);
      // Clear custom text when any selection is made
      if (customText) {
        setCustomText('');
      }
    } else if (customText) {
      onChange(customText);
    }
  }, [selectedAction, selectedWho, selectedPower, customText, onChange]);

  useEffect(() => {
    if (value && !customText && !selectedAction) {
      setCustomText(value);
    }
  }, [value, customText, selectedAction]);

  const handleSurpriseMe = () => {
    const randomAction = ACTION_OPTIONS[Math.floor(Math.random() * ACTION_OPTIONS.length)];
    const randomWho = WHO_WHAT_OPTIONS[Math.floor(Math.random() * WHO_WHAT_OPTIONS.length)];
    const randomPower = POWER_OPTIONS[Math.floor(Math.random() * POWER_OPTIONS.length)];
    
    setSelectedAction(randomAction);
    setSelectedWho(randomWho);
    setSelectedPower(randomPower);
    setCustomText('');
  };

  const handleClear = () => {
    setSelectedAction(null);
    setSelectedWho(null);
    setSelectedPower(null);
    setCustomText('');
    onChange('');
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleOptionSelect = (option: MissionOption) => {
    currentSlideData.onSelect(option);
    setCustomText('');
    
    // Auto-advance to next slide after selection
    setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Your Mission</h2>
        <p className="text-gray-600">Tap one from each row to build your story.</p>
      </motion.div>

      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="text-xl font-medium text-gray-700">
          I will{' '}
          <span className={`inline-block px-3 py-1 rounded ${selectedAction ? 'bg-red-100 text-red-600 border border-red-300' : 'text-gray-400'}`}>
            [{selectedAction?.label || 'Action'}]
          </span>{' '}
          <span className={`inline-block px-3 py-1 rounded ${selectedWho ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'text-gray-400'}`}>
            [{selectedWho?.label || 'Who/What'}]
          </span>{' '}
          <span className={`inline-block px-3 py-1 rounded ${selectedPower ? 'bg-green-100 text-green-600 border border-green-300' : 'text-gray-400'}`}>
            [{selectedPower?.label || 'Power'}]
          </span>.
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          onClick={handleSurpriseMe}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🎲</span>
          <span>Surprise me</span>
        </motion.button>
        
        <motion.button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🔄</span>
          <span>Clear</span>
        </motion.button>
      </div>

      {/* Main Carousel Container */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        {/* Slide Title */}
        <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
          {currentSlideData.title} <span className="text-gray-400">(choose 1)</span>
        </h3>

        {/* Main Slide Navigation */}
        <div className="relative">
          {/* Previous Slide Button */}
          {currentSlide > 0 && (
            <button
              onClick={handlePreviousSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <span className="text-xl">‹</span>
            </button>
          )}

          {/* Next Slide Button */}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <span className="text-xl">›</span>
            </button>
          )}

          {/* Options Display - 4x2 Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`grid gap-4 ${currentSlideData.options.length === 8 ? 'grid-cols-4' : currentSlideData.options.length === 7 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {currentSlideData.options.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all min-h-[140px] ${
                      currentSlideData.selected?.id === option.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-6xl mb-3">{option.emoji}</div>
                    <div className="text-base font-bold text-gray-800">{option.label}</div>
                    {currentSlideData.selected?.id === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Slide Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all ${
                index === currentSlide 
                  ? 'w-8 h-2 bg-purple-500 rounded-full' 
                  : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-center text-gray-600 font-medium mb-4">I want to type my own:</h3>
        <textarea
          value={(selectedAction || selectedWho || selectedPower) ? 
            `I will ${selectedAction ? selectedAction.label : '[Action]'} my ${selectedWho ? selectedWho.label : '[Who/What]'} with ${selectedPower ? selectedPower.label : '[Power]'}.` : 
            customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            onChange(e.target.value);
            if (e.target.value) {
              setSelectedAction(null);
              setSelectedWho(null);
              setSelectedPower(null);
            }
          }}
          placeholder="e.g., flying with Superman, building a robot, saving the day"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 min-h-24 resize-none"
          maxLength={200}
        />
        <div className="text-right text-sm text-gray-500 mt-2">
          {((selectedAction || selectedWho || selectedPower) ? 
            `I will ${selectedAction ? selectedAction.label : '[Action]'} my ${selectedWho ? selectedWho.label : '[Who/What]'} with ${selectedPower ? selectedPower.label : '[Power]'}.` : 
            customText).length}/200 characters
        </div>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}