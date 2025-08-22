'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import Camera from '@/components/Camera';
import CareerTypeahead from '@/components/CareerTypeahead';
import CustomCareerModal from '@/components/CustomCareerModal';
import LocationImageGrid from '@/components/LocationImageGrid';
import { PosterData } from '@/lib/prompts';
import { CareerOption } from '@/lib/careers';
import { LocationOption } from '@/lib/locations';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';

const dreamSchema = z.object({
  career: z.string().min(1, 'Please select a career'),
  background: z.string().min(1, 'Please select a location'),
  activity: z.string().min(3, 'Please describe an activity (at least 3 characters)'),
  selfieDataUrl: z.string().optional(),
  avatarSelection: z.string().optional()
});

type DreamFormData = z.infer<typeof dreamSchema>;

export default function DreamPage() {
  const router = useRouter();
  const { updatePosterData, currentPosterData } = useAppStore();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DreamFormData>({
    career: currentPosterData.career || '',
    background: currentPosterData.background || '',
    activity: currentPosterData.activity || '',
    selfieDataUrl: undefined,
    avatarSelection: undefined
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DreamFormData, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomCareerModal, setShowCustomCareerModal] = useState(false);
  const [customCareerSearchTerm, setCustomCareerSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const steps = [
    { title: 'Choose Your Career', subtitle: 'What superhero job will you have?' },
    { title: 'Pick Your Location', subtitle: 'Where in Singapore will you work?' },
    { title: 'Describe Your Activity', subtitle: 'What exciting thing will you do?' },
    { title: 'Add Your Face', subtitle: 'Show us the hero!' }
  ];

  const validateStep = (step: number): boolean => {
    const stepErrors: Partial<Record<keyof DreamFormData, string>> = {};
    
    switch (step) {
      case 0:
        if (!formData.career) stepErrors.career = 'Please select a career';
        break;
      case 1:
        if (!formData.background) stepErrors.background = 'Please select a location';
        break;
      case 2:
        if (!formData.activity || formData.activity.length < 3) {
          stepErrors.activity = 'Please describe an activity (at least 3 characters)';
        }
        break;
      case 3:
        if (!formData.selfieDataUrl && !formData.avatarSelection) {
          stepErrors.selfieDataUrl = 'Please take a selfie or choose an avatar';
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/');
    }
  };

  const handleCareerChange = (career: CareerOption | null) => {
    if (career) {
      setFormData({ ...formData, career: career.value });
      setErrors({ ...errors, career: undefined });
    }
  };

  const handleLocationChange = (location: LocationOption) => {
    setFormData({ ...formData, background: location.value });
    setErrors({ ...errors, background: undefined });
  };

  const handleRequestCustomCareer = (searchTerm: string) => {
    setCustomCareerSearchTerm(searchTerm);
    setShowCustomCareerModal(true);
  };

  const handleAddCustomCareer = (career: CareerOption) => {
    setFormData({ ...formData, career: career.value });
    setErrors({ ...errors, career: undefined });
    setShowCustomCareerModal(false);
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      
      const posterData: PosterData = {
        career: formData.career,
        background: formData.background,
        activity: formData.activity
      };

      updatePosterData(posterData);

      // Store image data separately if available
      if (formData.selfieDataUrl || formData.avatarSelection) {
        sessionStorage.setItem('dreamBigSelfie', formData.selfieDataUrl || '');
        sessionStorage.setItem('dreamBigAvatar', formData.avatarSelection || '');
      }

      router.push('/result');
    } catch (error) {
      console.error('Error preparing poster data:', error);
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="career"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <CareerTypeahead
              value={formData.career}
              onChange={handleCareerChange}
              onRequestCustomCareer={handleRequestCustomCareer}
              error={errors.career}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="background"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <LocationImageGrid
              value={formData.background}
              onChange={handleLocationChange}
              error={errors.background}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div>
              <textarea
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                placeholder="e.g., flying with Superman, building a robot, saving the day..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 min-h-32 resize-none"
                maxLength={200}
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {formData.activity.length}/200 characters
              </div>
            </div>
            {errors.activity && (
              <p className="text-red-500 text-center font-medium">{errors.activity}</p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="camera"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Camera
              onCapture={(imageDataUrl) => {
                setFormData({ 
                  ...formData, 
                  selfieDataUrl: imageDataUrl,
                  avatarSelection: undefined 
                });
                setErrors({ ...errors, selfieDataUrl: undefined });
              }}
              onSelectAvatar={(avatar) => {
                setFormData({ 
                  ...formData, 
                  avatarSelection: avatar,
                  selfieDataUrl: undefined 
                });
                setErrors({ ...errors, selfieDataUrl: undefined });
              }}
              currentImage={formData.selfieDataUrl}
            />
            {errors.selfieDataUrl && (
              <p className="text-red-500 text-center font-medium mt-4">{errors.selfieDataUrl}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

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
            Dream Builder ✨
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s create your superhero adventure!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mt-1">
              {steps[currentStep].subtitle}
            </p>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          className="bg-white rounded-xl p-8 shadow-lg mb-8 min-h-96"
          layout
        >
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={isGenerating}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
            }`}
            whileHover={!isGenerating ? { scale: 1.05 } : {}}
            whileTap={!isGenerating ? { scale: 0.95 } : {}}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Creating Magic...</span>
              </div>
            ) : currentStep === steps.length - 1 ? (
              'Generate Poster! 🎨'
            ) : (
              'Next →'
            )}
          </motion.button>
        </div>

        {/* Custom Career Modal */}
        <CustomCareerModal
          isOpen={showCustomCareerModal}
          onClose={() => setShowCustomCareerModal(false)}
          onAdd={handleAddCustomCareer}
          initialCareerName={customCareerSearchTerm}
        />
      </div>
    </div>
  );
}