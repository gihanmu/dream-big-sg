'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCareerDisplayName, getLocationDisplayName } from '@/lib/prompts';

interface PosterFrameProps {
  imageUrl: string;
  title: string;
  career: string;
  background: string;
  activity: string;
  onSave: () => void;
  onRegenerate: () => void;
  onAddToGallery: () => void;
  onStartOver: () => void;
  isLoading?: boolean;
  currentModel?: 'realistic' | 'detailed' | 'lucky' | null;
  nextModel?: 'realistic' | 'detailed' | 'lucky' | null;
}

// Generate stable sparkle positions
const generateSparkles = () => {
  // Use deterministic values based on index to avoid hydration mismatch
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: ((i * 37) % 100),
    top: ((i * 43) % 100),
    duration: 2 + (i % 3),
    delay: (i % 4) * 0.5
  }));
};

export default function PosterFrame({
  imageUrl,
  title,
  career,
  background,
  activity,
  onSave,
  onRegenerate,
  onAddToGallery,
  onStartOver,
  isLoading = false,
  currentModel,
  nextModel
}: PosterFrameProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sparkles] = useState(generateSparkles);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    try {
      // Create a canvas to combine the image with event branding
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        // Set canvas size (poster dimensions - larger for better quality)
        canvas.width = 1024;
        canvas.height = 768;

        // Draw the generated image
        ctx.drawImage(img, 0, 0, 1024, 768);

        // Add event branding footer with better design
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(0, 680, 1024, 100);

        // Add event title
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('Big Heart Student Care 10th Anniversary', 512, 700);

        // Add subtitle  
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 16px serif';
        ctx.fillText('Dream Big, Chase Your Rainbow', 512, 720);

        // Add date
        ctx.fillStyle = '#2C3E50';
        ctx.font = '14px serif';
        const date = new Date().toLocaleDateString('en-SG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        ctx.fillText(date, 512, 740);

        // Load and draw logos with new layout
        const logoY = 700;
        const logoHeight = 30;
        
        // New layout: Left side (NCS, Google), Right side (Big Heart, Singapore flag)
        const leftLogoX1 = 100;  // NCS logo position (left side)
        const leftLogoX2 = 200;  // Google logo position (left side)
        const rightLogoX1 = 824;  // Big Heart logo position (right side)
        const rightLogoX2 = 924;  // Singapore flag position (right side)

        // Function to load and draw logos
        const loadAndDrawLogos = async () => {
          try {
            // Create logo image elements
            const ncsLogo = new window.Image();
            const googleLogo = new window.Image();
            const bigHeartLogo = new window.Image();

            // Set crossOrigin for logo images
            [ncsLogo, googleLogo, bigHeartLogo].forEach(img => {
              img.crossOrigin = 'anonymous';
            });

            // Load all logos (no Singapore flag image, will draw flag manually)
            const logoPromises = [
              new Promise((resolve, reject) => {
                ncsLogo.onload = () => resolve(ncsLogo);
                ncsLogo.onerror = reject;
                ncsLogo.src = '/images/ncs-logo-big.png';
              }),
              new Promise((resolve, reject) => {
                googleLogo.onload = () => resolve(googleLogo);
                googleLogo.onerror = reject;
                googleLogo.src = '/images/google-big.png';
              }),
              new Promise((resolve, reject) => {
                bigHeartLogo.onload = () => resolve(bigHeartLogo);
                bigHeartLogo.onerror = reject;
                bigHeartLogo.src = '/images/big-heart-student-care-result.jpeg';
              })
            ];

            const [ncsImg, googleImg, bigHeartImg] = await Promise.all(logoPromises);

            // Helper function to draw logo with proper scaling
            const drawLogo = (img: HTMLImageElement, x: number, maxHeight: number) => {
              const aspectRatio = img.width / img.height;
              const drawHeight = Math.min(maxHeight, img.height);
              const drawWidth = drawHeight * aspectRatio;
              
              // Center logo horizontally at x position
              const drawX = x - drawWidth / 2;
              const drawY = logoY - drawHeight / 2;
              
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            };

            // Draw left side logos (NCS, Google)
            drawLogo(ncsImg as HTMLImageElement, leftLogoX1, logoHeight);
            drawLogo(googleImg as HTMLImageElement, leftLogoX2, logoHeight);

            // Draw right side logo (Big Heart)
            drawLogo(bigHeartImg as HTMLImageElement, rightLogoX1, logoHeight);

            // Draw Singapore flag manually
            const flagWidth = 40;
            const flagHeight = 27;
            const flagX = rightLogoX2 - flagWidth / 2;
            const flagY = logoY - flagHeight / 2;

            // Singapore flag - red top, white bottom
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(flagX, flagY, flagWidth, flagHeight / 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(flagX, flagY + flagHeight / 2, flagWidth, flagHeight / 2);

            // Add thin border around flag
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(flagX, flagY, flagWidth, flagHeight);

          } catch (error) {
            console.warn('Failed to load logo images, using fallback text:', error);
            
            // Fallback to text-based logos if images fail
            ctx.fillStyle = '#2C3E50';
            ctx.font = 'bold 10px serif';
            ctx.textAlign = 'center';
            
            ctx.fillText('NCS', leftLogoX1, logoY);
            ctx.fillText('GOOGLE', leftLogoX2, logoY);
            ctx.fillText('BIG HEART', rightLogoX1, logoY);
            ctx.fillText('🇸🇬', rightLogoX2, logoY);
          }
        };

        // Load and draw logos
        await loadAndDrawLogos();

        // Download the combined image
        const link = document.createElement('a');
        link.download = `superhero-poster-${getCareerDisplayName(career).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = imageUrl;
      
      onSave();
    } catch (error) {
      console.error('Error saving poster:', error);
      alert('Error saving poster. Please try again.');
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Poster Frame */}
      <div className="relative">
        {/* Decorative Frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-4 shadow-2xl">
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 rounded-2xl p-3">
            <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-600 font-medium">Creating your superhero poster...</p>
                  </div>
                </div>
              )}

              {/* Generated Image */}
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <img
                    src={imageUrl}
                    alt={`Superhero poster: ${title}`}
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Poster Content Container */}
        <div className="relative aspect-[4/3] w-full">
          {/* This creates the proper aspect ratio container */}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!imageLoaded || isLoading}
        >
          <span>💾</span>
          <span>Save PNG</span>
        </motion.button>

        <motion.button
          onClick={onRegenerate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          <span>🎲</span>
          <div className="flex flex-col items-start">
            <span>Surprise Me Again</span>
            {nextModel && (
              <span className="text-xs opacity-75">
                Next: {nextModel === 'realistic' ? '👤 Face Match' : '✨ Detailed'}
              </span>
            )}
          </div>
        </motion.button>

        <motion.button
          onClick={onAddToGallery}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!imageLoaded || isLoading}
        >
          <span>🎨</span>
          <span>Add to Gallery</span>
        </motion.button>

        <motion.button
          onClick={onStartOver}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🏠</span>
          <span>Start Over</span>
        </motion.button>
      </motion.div>

      {/* Helpful message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4 text-center"
      >
        <p className="text-gray-600 text-sm">
          💡 Not happy with your poster? Click <span className="font-bold text-orange-500">Surprise Me Again</span> to generate a new one!
        </p>
      </motion.div>

      {/* Poster Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <h3 className="font-bold text-purple-600 mb-1">Career</h3>
            <p className="text-gray-700">{getCareerDisplayName(career)}</p>
          </div>
          <div>
            <h3 className="font-bold text-purple-600 mb-1">Location</h3>
            <p className="text-gray-700">{getLocationDisplayName(background)}</p>
          </div>
          <div>
            <h3 className="font-bold text-purple-600 mb-1">Activity</h3>
            <p className="text-gray-700 text-sm">{activity}</p>
          </div>
          {currentModel && (
            <div>
              <h3 className="font-bold text-purple-600 mb-1">Style</h3>
              <p className="text-gray-700 text-sm">
                {currentModel === 'realistic' ? '👤 Face Match' : 
                 currentModel === 'detailed' ? '✨ Detailed' : 
                 '🎲 Lucky'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Sparkles - Only render on client to avoid hydration mismatch */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute text-yellow-400"
              style={{
                left: `${sparkle.left}%`,
                top: `${sparkle.top}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: sparkle.duration,
                repeat: Infinity,
                delay: sparkle.delay,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}