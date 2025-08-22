'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientOnlyWrapper from './ClientOnlyWrapper';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  altText: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Courage",
    subtitle: "Red Lions Parachuting",
    imageUrl: "/images/red-lions.jpg",
    altText: "Red Lions parachuting with Singapore flags, showcasing courage and national pride"
  },
  {
    id: 2,
    title: "Care",
    subtitle: "Healthcare Heroes",
    imageUrl: "/images/healthcare.jpg", 
    altText: "Doctors and nurses caring for patients, representing healthcare heroes"
  },
  {
    id: 3,
    title: "Knowledge", 
    subtitle: "Inspiring Teachers",
    imageUrl: "/images/teachers.jpg",
    altText: "Teachers educating and inspiring the next generation"
  },
  {
    id: 4,
    title: "Build",
    subtitle: "Engineers & Builders",
    imageUrl: "/images/engineers.jpg",
    altText: "Engineers and builders constructing Singapore's infrastructure"
  },
  {
    id: 5,
    title: "Invent",
    subtitle: "Scientists & Researchers", 
    imageUrl: "/images/scientists.jpg",
    altText: "Scientists and researchers working on innovative technologies"
  },
  {
    id: 6,
    title: "Respect",
    subtitle: "Essential Workers",
    imageUrl: "/images/cleaners.jpg",
    altText: "Cleaners and maintenance crew keeping Singapore clean and safe"
  },
  {
    id: 7,
    title: "Connect",
    subtitle: "Transport Heroes",
    imageUrl: "/images/transport.jpg",
    altText: "MRT and bus captains connecting communities across Singapore"
  }
];

interface LoginCarouselProps {
  className?: string;
}

export default function LoginCarousel({ className = '' }: LoginCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        setIsPaused(!isPaused);
        break;
    }
  };

  return (
    <div 
      className={`relative h-full w-full overflow-hidden ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Singapore heroes carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Singapore Skyline Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-slate-900/50 to-transparent z-10" />
        <motion.div
          className="absolute bottom-0 w-full h-40 opacity-30"
          animate={{ 
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="flex items-end justify-center h-full space-x-4">
            {/* Simplified skyline silhouettes */}
            <div className="w-8 h-20 bg-gray-600 rounded-t" />
            <div className="w-12 h-32 bg-gray-500" />
            <div className="w-6 h-16 bg-gray-600 rounded-t" />
            <div className="w-16 h-28 bg-gray-400" />
            <div className="w-4 h-12 bg-gray-600" />
          </div>
        </motion.div>
      </div>

      {/* Main Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className="text-center z-20 px-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-8xl font-bold text-white mb-4 drop-shadow-2xl">
                {slides[currentSlide].title}
              </h2>
              <p className="text-3xl text-white/90 font-medium drop-shadow-lg">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
            
            {/* Career illustration placeholder */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 1 }}
            >
              <div className="text-[20rem] select-none">
                {slides[currentSlide].id === 1 && '🪂'}
                {slides[currentSlide].id === 2 && '🏥'}
                {slides[currentSlide].id === 3 && '📚'}
                {slides[currentSlide].id === 4 && '🏗️'}
                {slides[currentSlide].id === 5 && '🔬'}
                {slides[currentSlide].id === 6 && '🧹'}
                {slides[currentSlide].id === 7 && '🚊'}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-all duration-300"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-all duration-300"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}: ${slides[index].title}`}
          />
        ))}
      </div>

      {/* Tagline */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-xl text-white font-medium drop-shadow-lg">
          &quot;Become a Superhero and Build Singapore!&quot;
        </p>
      </motion.div>

      {/* Floating particles effect */}
      <ClientOnlyWrapper>
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </ClientOnlyWrapper>
    </div>
  );
}