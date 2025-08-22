'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, GeneratedPoster } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { getCareerDisplayName, getLocationDisplayName } from '@/lib/prompts';

export default function GalleryPage() {
  const router = useRouter();
  const { generatedPosters, loadPostersFromStorage } = useAppStore();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPoster, setSelectedPoster] = useState<GeneratedPoster | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      loadPostersFromStorage();
    }
  }, [isLoading, isAuthenticated, loadPostersFromStorage, router]);

  const handlePosterClick = (poster: GeneratedPoster) => {
    setSelectedPoster(poster);
  };

  const handleCloseLightbox = () => {
    setSelectedPoster(null);
  };

  const handleDownload = (poster: GeneratedPoster) => {
    // Create download link
    const link = document.createElement('a');
    link.href = poster.imageUrl;
    link.download = `superhero-poster-${poster.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = async (poster: GeneratedPoster) => {
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
        posterImg.src = poster.imageUrl;
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
          link.download = `superhero-poster-${getCareerDisplayName(poster.data.career).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
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
  };

  const handleCreateNew = () => {
    router.push('/dream');
  };

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'doctor': 'bg-red-500',
      'teacher': 'bg-blue-500', 
      'engineer': 'bg-orange-500',
      'scientist': 'bg-green-500',
      'firefighter': 'bg-red-600',
      'pilot': 'bg-sky-500',
      'programmer': 'bg-indigo-500',
      'cleaner': 'bg-yellow-500',
      'transport': 'bg-purple-500'
    };
    return colors[badge] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            My Superhero Gallery 🎨
          </h1>
          <p className="text-xl text-gray-600">
            Your collection of amazing superhero adventures!
          </p>
        </motion.div>

        {/* Stats */}
        {generatedPosters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {generatedPosters.length}
                </div>
                <div className="text-gray-600">Posters Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(generatedPosters.map(p => p.data.career)).size}
                </div>
                <div className="text-gray-600">Career Paths</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {new Set(generatedPosters.map(p => p.data.background)).size}
                </div>
                <div className="text-gray-600">Locations Explored</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {generatedPosters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-12 text-center shadow-lg"
          >
            <div className="text-8xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Your Gallery is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start creating your superhero posters to build an amazing collection of your dreams!
            </p>
            <motion.button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create My First Poster! ✨
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {generatedPosters.map((poster, index) => (
              <motion.div
                key={poster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handlePosterClick(poster)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Poster Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={poster.imageUrl}
                    alt={`Superhero poster: ${poster.data.career}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">👁️</div>
                      <div className="font-medium">View Details</div>
                    </div>
                  </div>
                </div>

                {/* Poster Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">
                      {getCareerDisplayName(poster.data.career)} Hero
                    </h3>
                    <div className="flex gap-1">
                      {poster.badges?.map((badge, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs text-white rounded-full ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {getLocationDisplayName(poster.data.background)}
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {poster.data.activity}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(poster.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(poster);
                        }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Download"
                      >
                        💾
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(poster);
                        }}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                        title="Print"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create New Button */}
        {generatedPosters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>➕</span>
              <span>Create Another Poster</span>
            </motion.button>
          </motion.div>
        )}

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <motion.button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Back to Home
          </motion.button>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={handleCloseLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {getCareerDisplayName(selectedPoster.data.career)} Superhero
                  </h2>
                  <button
                    onClick={handleCloseLightbox}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Image */}
                <img
                  src={selectedPoster.imageUrl}
                  alt="Superhero poster"
                  className="w-full rounded-lg mb-4"
                />

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <strong className="text-purple-600">Career:</strong>
                    <span className="ml-2">{getCareerDisplayName(selectedPoster.data.career)}</span>
                  </div>
                  <div>
                    <strong className="text-purple-600">Location:</strong>
                    <span className="ml-2">{getLocationDisplayName(selectedPoster.data.background)}</span>
                  </div>
                  <div>
                    <strong className="text-purple-600">Activity:</strong>
                    <span className="ml-2">{selectedPoster.data.activity}</span>
                  </div>
                  <div>
                    <strong className="text-purple-600">Created:</strong>
                    <span className="ml-2">{new Date(selectedPoster.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6 justify-center">
                  <button
                    onClick={() => handleDownload(selectedPoster)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    💾 Download
                  </button>
                  <button
                    onClick={() => handlePrint(selectedPoster)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}