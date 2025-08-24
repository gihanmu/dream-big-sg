'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PosterFrame from '@/components/PosterFrame';
import { useAppStore } from '@/lib/store';
import { generateImagenPrompt, getCareerDisplayName } from '@/lib/prompts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-context';
import ClientOnlyWrapper from '@/components/ClientOnlyWrapper';
import ConfettiEffect from '@/components/ConfettiEffect';

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    generationType?: 'image-editing';
    requiresClientOverlay?: boolean;
    hasUploadedPhoto?: boolean;
    [key: string]: unknown;
  };
}

export default function ResultPage() {
  const router = useRouter();
  const { currentPosterData, addGeneratedPoster, isFirstLogin } = useAppStore();
  const { isAuthenticated, isLoading } = useAuth();
  const { showSuccess } = useToast();
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastUsedModel, setLastUsedModel] = useState<'realistic' | 'detailed' | 'lucky' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!currentPosterData.career || !currentPosterData.background || !currentPosterData.activity) {
        router.push('/dream');
        return;
      }

      generatePoster();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, currentPosterData.career, currentPosterData.background, currentPosterData.activity]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const generatePoster = async (overrideModel?: 'realistic' | 'detailed' | 'lucky') => {
    console.log('🎨 [Result Page] Starting poster generation');
    
    try {
      setIsGenerating(true);
      setError(null);

      // Start playing audio during generation
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio('/audio/result-song.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true; // Keep playing throughout and after generation
        audioRef.current.play().catch(audioError => {
          console.log('Audio playback failed (user interaction required):', audioError);
        });
      } catch (audioError) {
        console.log('Audio not available:', audioError);
      }

      const selfieDataUrl = sessionStorage.getItem('dreamBigSelfie') || undefined;
      
      if (!selfieDataUrl) {
        throw new Error('Camera photo is required');
      }
      
      const prompt = generateImagenPrompt({
        career: currentPosterData.career || '',
        background: currentPosterData.background || '',
        activity: currentPosterData.activity || ''
      });
      
      console.log('📝 [Result Page] Generated prompt:', prompt);
      console.log('👤 [Result Page] Has selfie:', !!selfieDataUrl);

      // Determine which model to use
      let selectedModel: 'realistic' | 'detailed' | 'lucky';
      
      if (overrideModel) {
        selectedModel = overrideModel;
      } else if (lastUsedModel) {
        // Cycle only between detailed and realistic (skip lucky in cycling)
        if (lastUsedModel === 'lucky') {
          // If last was lucky, start with detailed for cycling
          selectedModel = 'detailed';
        } else {
          // Cycle between detailed and realistic only
          const models: ('detailed' | 'realistic')[] = ['detailed', 'realistic'];
          const currentIndex = models.indexOf(lastUsedModel as 'detailed' | 'realistic');
          selectedModel = models[(currentIndex + 1) % models.length];
        }
      } else {
        // First generation - get from sessionStorage
        selectedModel = (sessionStorage.getItem('dreamBigSelectedModel') as 'realistic' | 'detailed' | 'lucky') || 'detailed';
      }
      
      console.log('🎯 [Result Page] Using model:', selectedModel);
      setLastUsedModel(selectedModel);

      const requestData = {
        prompt,
        career: currentPosterData.career,
        background: currentPosterData.background,
        activity: currentPosterData.activity,
        aspect: '4:3',
        selfieDataUrl,
        bgHint: currentPosterData.background,
        selectedModel
      };
      
      console.log('🚀 [Result Page] Sending request to /api/imagen:', requestData);
      
      const response = await fetch('/api/imagen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Try to get more specific error message from response
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ [Result Page] API Error Details:', errorData);
        } catch (jsonError) {
          console.error('❌ [Result Page] Could not parse error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }

      const result: GenerationResult = await response.json();
      console.log('📥 [Result Page] Received response:', result);

      if (result.success && result.imageUrl) {
        console.log('✅ [Result Page] Image generation successful');
        console.log('🖼️ [Result Page] Image URL (first 100 chars):', result.imageUrl.substring(0, 100) + '...');
        console.log('📊 [Result Page] Generation metadata:', result.metadata);
        
        // AI now handles photo integration seamlessly
        setGeneratedImage(result.imageUrl);
        
        setShowConfetti(true);
        
        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        console.error('❌ [Result Page] Image generation failed:', result.error);
        throw new Error(result.error || 'Failed to generate poster');
      }
    } catch (err) {
      console.error('❌ [Result Page] Error generating poster:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate poster');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    console.log('Poster saved successfully!');
  };

  const handleStartOver = () => {
    // Stop audio when starting over
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Clear all previous selections and data
    const { clearPosterData } = useAppStore.getState();
    clearPosterData();
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dreamBigSelfie');
      sessionStorage.removeItem('dreamBigAvatar');
    }
    
    router.push('/dream');
  };

  const handleRegenerate = () => {
    console.log('🔄 [Result Page] Generate Again button clicked');
    setGeneratedImage(null);
    generatePoster();
  };

  const handleAddToGallery = () => {
    if (generatedImage) {
      const poster = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        data: {
          career: currentPosterData.career || '',
          background: currentPosterData.background || '',
          activity: currentPosterData.activity || ''
        },
        createdAt: new Date().toISOString(),
        badges: [getCareerDisplayName(currentPosterData.career || '') || 'Hero']
      };
      
      addGeneratedPoster(poster);
      
      // Show success message
      showSuccess('Poster added to your gallery! 🎉', '🎨');
    }
  };

  const handleBackToDream = () => {
    router.push('/dream');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-100 to-pink-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={handleRegenerate}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
            
            <motion.button
              onClick={handleBackToDream}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Dream
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Your Superhero Poster! 🎨
          </h1>
          {isFirstLogin && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-purple-600 font-medium"
            >
              Welcome to your first superhero adventure! 🎉
            </motion.p>
          )}
        </motion.div>

        {/* Poster Display */}
        <PosterFrame
          imageUrl={generatedImage || ''}
          title="Singapore Superhero"
          career={currentPosterData.career || ''}
          background={currentPosterData.background || ''}
          activity={currentPosterData.activity || ''}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onAddToGallery={handleAddToGallery}
          onStartOver={handleStartOver}
          isLoading={isGenerating}
          currentModel={lastUsedModel}
          nextModel={lastUsedModel ? (() => {
            // Show next model in cycling (only between detailed and realistic)
            if (lastUsedModel === 'lucky') {
              return 'detailed';
            } else {
              const models: ('detailed' | 'realistic')[] = ['detailed', 'realistic'];
              const currentIndex = models.indexOf(lastUsedModel as 'detailed' | 'realistic');
              return models[(currentIndex + 1) % models.length];
            }
          })() : null}
        />

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={handleBackToDream}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✏️</span>
            <span>Create Another Dream</span>
          </motion.button>
          
          <motion.button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </motion.button>
        </motion.div>

        {/* Success Message for First Time Users */}
        {isFirstLogin && !isGenerating && generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Congratulations, Young Hero!
            </h3>
            <p className="text-green-700">
              You&apos;ve created your first superhero poster! Your dreams are already building Singapore&apos;s future.
            </p>
          </motion.div>
        )}

        {/* Confetti Effect */}
        <ClientOnlyWrapper>
          <ConfettiEffect show={showConfetti} />
        </ClientOnlyWrapper>
      </div>
    </div>
  );
}