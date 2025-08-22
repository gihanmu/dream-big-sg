'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getCareerDisplayName, getLocationDisplayName } from '@/lib/prompts';

interface PosterFrameProps {
  imageUrl: string;
  title: string;
  career: string;
  background: string;
  activity: string;
  onSave: () => void;
  onPrint: () => void;
  onRegenerate: () => void;
  onAddToGallery: () => void;
  isLoading?: boolean;
}

export default function PosterFrame({
  imageUrl,
  title,
  career,
  background,
  activity,
  onSave,
  onPrint,
  onRegenerate,
  onAddToGallery,
  isLoading = false
}: PosterFrameProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSave = async () => {
    try {
      // Create a canvas to combine the image with the footer
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Set canvas size (poster dimensions)
        canvas.width = 512;
        canvas.height = 384;

        // Draw the generated image
        ctx.drawImage(img, 0, 0, 512, 384);

        // Add footer bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 350, 512, 34);

        // Add date in center
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const date = new Date().toLocaleDateString();
        ctx.fillText(date, 256, 368);

        // Add Google logo text (bottom-left)
        ctx.textAlign = 'left';
        ctx.font = '10px Arial';
        ctx.fillText('Google', 10, 378);

        // Add NCS text (bottom-right)
        ctx.textAlign = 'right';
        ctx.fillText('NCS', 502, 378);

        // Download the combined image
        const link = document.createElement('a');
        link.download = `superhero-poster-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = imageUrl;
      
      onSave();
    } catch (error) {
      console.error('Error saving poster:', error);
    }
  };

  const handlePrint = async () => {
    try {
      // Create a canvas to combine the image with logos
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size (poster dimensions)
      canvas.width = 1024;
      canvas.height = 768;

      // Load the generated poster image
      const posterImg = new window.Image();
      posterImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        posterImg.onload = resolve;
        posterImg.onerror = reject;
        posterImg.src = imageUrl;
      });

      // Draw the poster image (full size)
      ctx.drawImage(posterImg, 0, 0, canvas.width, canvas.height);

      // Load and draw Google logo (top-left)
      try {
        const googleImg = new window.Image();
        googleImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          googleImg.onload = resolve;
          googleImg.onerror = reject;
          googleImg.src = '/images/google.png';
        });

        // Draw Google logo with semi-transparent white background
        const logoSize = 80;
        const padding = 16;
        
        // White background for Google logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(padding, padding, logoSize + 16, logoSize + 16);
        
        // Draw Google logo
        ctx.drawImage(googleImg, padding + 8, padding + 8, logoSize, logoSize);
      } catch (error) {
        console.warn('Could not load Google logo:', error);
      }

      // Load and draw NCS logo (top-right)
      try {
        const ncsImg = new window.Image();
        ncsImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          ncsImg.onload = resolve;
          ncsImg.onerror = reject;
          ncsImg.src = '/images/ncs.jpg';
        });

        // Draw NCS logo with semi-transparent white background
        const logoSize = 80;
        const padding = 16;
        
        // White background for NCS logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(canvas.width - logoSize - padding - 16, padding, logoSize + 16, logoSize + 16);
        
        // Draw NCS logo
        ctx.drawImage(ncsImg, canvas.width - logoSize - padding - 8, padding + 8, logoSize, logoSize);
      } catch (error) {
        console.warn('Could not load NCS logo:', error);
      }

      // Add event branding text at the bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Dream Big Singapore - A Google Cloud & NCS Initiative', canvas.width / 2, canvas.height - 20);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `superhero-poster-${getCareerDisplayName(career).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error creating printable poster:', error);
      alert('Sorry, there was an error creating your printable poster. Please try again.');
    }
    
    onPrint();
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
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!imageLoaded || isLoading}
        >
          <span>🖨️</span>
          <span>Print</span>
        </motion.button>

        <motion.button
          onClick={onRegenerate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          <span>🔄</span>
          <span>Generate Again</span>
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
      </motion.div>

      {/* Poster Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
        </div>
      </motion.div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}