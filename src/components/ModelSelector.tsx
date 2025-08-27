'use client';

import { motion } from 'framer-motion';

export type ModelType = 'detailed' | 'face-match' | 'gemini-flash';

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  error?: string;
}

const models = [
  {
    id: 'gemini-flash' as ModelType,
    name: 'Smart Realistic',
    emoji: '⚡',
    description: 'AI-powered photorealistic transformation with intelligent face preservation',
    features: [
      'Best overall quality',
      'Smart face preservation',
      'Photorealistic results',
      'Natural superhero integration'
    ],
    bestFor: 'Best quality - realistic superhero you',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'detailed' as ModelType,
    name: 'Fancy and Detailed',
    emoji: '🎨',
    description: 'Creates artistic, detailed superhero imagery with creative flair',
    features: [
      'Ultra-detailed artwork',
      'Artistic superhero styling',
      'Creative interpretation',
      'Professional poster quality'
    ],
    bestFor: 'Artistic, stylized poster art',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'face-match' as ModelType,
    name: 'Face Match',
    emoji: '👤',
    description: 'Embeds your actual photo into the poster for realistic representation',
    features: [
      'Your actual face preserved',
      'Realistic representation',
      'Identity recognition',
      'Personal connection'
    ],
    bestFor: 'Direct face embedding',
    gradient: 'from-blue-500 to-teal-500'
  }
];

export default function ModelSelector({ value, onChange, error }: ModelSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Choose Your Poster Style ✨
        </h3>
        <p className="text-gray-600">
          Pick how you&apos;d like your superhero poster to be created
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <motion.button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left h-full ${
              value === model.id
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: value === model.id ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-4xl">{model.emoji}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {model.name}
                </h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${model.gradient}`}>
                  {model.bestFor}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              {model.description}
            </p>

            {/* Features */}
            <div className="space-y-2">
              {model.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Selected Indicator */}
            {value === model.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Comparison Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
      >
        <div className="text-blue-700 text-sm">
          <strong>💡 Tip:</strong> <strong>Smart Realistic</strong> is recommended for best results! Choose <strong>Fancy and Detailed</strong> for artistic style, or <strong>Face Match</strong> for direct embedding.
        </div>
      </motion.div>

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