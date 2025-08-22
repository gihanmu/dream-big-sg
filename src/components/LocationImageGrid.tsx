'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LOCATION_OPTIONS, LocationOption } from '@/lib/locations';

interface LocationImageGridProps {
  value: string;
  onChange: (location: LocationOption) => void;
  error?: string;
}

export default function LocationImageGrid({ value, onChange, error }: LocationImageGridProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const handleLocationSelect = (location: LocationOption) => {
    onChange(location);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Choose Your Singapore Adventure Location 🏙️
        </h3>
        <p className="text-gray-600">
          Select where your superhero story will take place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LOCATION_OPTIONS.map((location) => (
          <motion.div
            key={location.value}
            className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
              value === location.value
                ? 'ring-4 ring-purple-500 shadow-2xl'
                : 'hover:shadow-xl'
            }`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLocationSelect(location)}
            onHoverStart={() => setHoveredLocation(location.value)}
            onHoverEnd={() => setHoveredLocation(null)}
          >
            {/* Location Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={location.imageUrl}
                alt={location.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a simple colored div if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Emoji indicator */}
              <div className="absolute top-3 right-3 text-2xl bg-white/90 rounded-full w-12 h-12 flex items-center justify-center">
                {location.emoji}
              </div>

              {/* Selection indicator */}
              {value === location.value && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-3 left-3 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
            </div>

            {/* Location Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-lg mb-1">{location.label}</h3>
              <p className="text-sm opacity-90 line-clamp-2">
                {location.description}
              </p>
            </div>

            {/* Hover Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: hoveredLocation === location.value ? 1 : 0
              }}
              className="absolute inset-0 bg-purple-500/20 pointer-events-none"
            />

            {/* Glow Effect for Selected */}
            {value === location.value && (
              <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.5)] pointer-events-none" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Location Summary */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="text-3xl">
              {LOCATION_OPTIONS.find(loc => loc.value === value)?.emoji}
            </div>
            <div>
              <h3 className="font-bold text-purple-800">
                Selected: {LOCATION_OPTIONS.find(loc => loc.value === value)?.label}
              </h3>
              <p className="text-sm text-purple-600">
                {LOCATION_OPTIONS.find(loc => loc.value === value)?.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-red-500 text-center font-medium">{error}</p>
      )}

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Did you know?
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Each location in Singapore has its own unique superhero opportunities!</p>
          <p>• Choose &quot;Any Random Place&quot; for a surprise adventure location!</p>
          <p>• Your superhero poster will feature iconic landmarks from your chosen spot!</p>
        </div>
      </motion.div>
    </div>
  );
}