'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Camera from '@/components/Camera';
import CareerTypeahead from '@/components/CareerTypeahead';
import CustomCareerModal from '@/components/CustomCareerModal';
import LocationImageGrid from '@/components/LocationImageGrid';
import MissionBuilder from '@/components/MissionBuilder';
import ModelSelector, { type ModelType } from '@/components/ModelSelector';
import { PosterData } from '@/lib/prompts';
import { CareerOption } from '@/lib/careers';
import { LocationOption } from '@/lib/locations';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';

type DreamFormData = {
  career: string;
  background: string;
  activity: string;
  selfieDataUrl: string;
  selectedModel: 'detailed' | 'face-match' | 'gemini-flash';
};

export default function DreamPage() {
  const router = useRouter();
  const { updatePosterData, currentPosterData } = useAppStore();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DreamFormData>({
    career: currentPosterData.career || '',
    background: currentPosterData.background || '',
    activity: currentPosterData.activity || '',
    selfieDataUrl: '',
    selectedModel: 'detailed' // Default to detailed model
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DreamFormData, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomCareerModal, setShowCustomCareerModal] = useState(false);
  const [customCareerSearchTerm, setCustomCareerSearchTerm] = useState('');

  const handleActivityChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, activity: value }));
    setErrors(prev => ({ ...prev, activity: undefined }));
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Reset form when currentPosterData is cleared (e.g., on start over)
  useEffect(() => {
    const hasData = currentPosterData.career || currentPosterData.background || currentPosterData.activity;
    
    if (!hasData) {
      // Reset form to initial state
      setFormData({
        career: '',
        background: '',
        activity: '',
        selfieDataUrl: '',
        selectedModel: 'detailed'
      });
      setCurrentStep(0);
      setErrors({});
      setIsGenerating(false);
      setShowCustomCareerModal(false);
      setCustomCareerSearchTerm('');
    } else {
      // Update form with current data
      setFormData(prev => ({
        ...prev,
        career: currentPosterData.career || prev.career,
        background: currentPosterData.background || prev.background,
        activity: currentPosterData.activity || prev.activity
      }));
    }
  }, [currentPosterData]);

  const steps = [
    { title: 'Pick Your Super Job', subtitle: 'What kind of superhero would you like to be' },
    { title: 'Pick Your Adventure Place', subtitle: 'Where in Singapore will your story happen' },
    { title: 'Plan Your Mission', subtitle: 'Tap one from each row to build your story.' },
    { title: 'Add Your Face', subtitle: 'Show us the hero!' },
    { title: 'Choose Your Style', subtitle: 'How would you like your poster to be created?' }
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
        if (!formData.selfieDataUrl) {
          stepErrors.selfieDataUrl = 'Please take a selfie photo';
        }
        break;
      case 4:
        if (!formData.selectedModel) {
          stepErrors.selectedModel = 'Please select a poster style';
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
        activity: formData.activity,
        selectedModel: formData.selectedModel
      };

      updatePosterData(posterData);

      // Store camera image data
      if (formData.selfieDataUrl) {
        sessionStorage.setItem('dreamBigSelfie', formData.selfieDataUrl);
        sessionStorage.removeItem('dreamBigAvatar'); // Clear any old avatar data
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
          >
            <MissionBuilder
              value={formData.activity}
              onChange={handleActivityChange}
              error={errors.activity}
            />
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
                  selfieDataUrl: imageDataUrl
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

      case 4:
        return (
          <motion.div
            key="model-selector"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ModelSelector
              value={formData.selectedModel}
              onChange={(model: ModelType) => {
                setFormData({ ...formData, selectedModel: model });
                setErrors({ ...errors, selectedModel: undefined });
              }}
              error={errors.selectedModel}
            />
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
            {steps.map((_, index) => (
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