'use client';

import { motion } from 'framer-motion';
import { LocationOption } from '@/lib/locations';

interface ActivitySuggestionsProps {
  selectedLocation: LocationOption | null;
  currentActivity: string;
  onActivityAdd: (activity: string) => void;
}

export default function ActivitySuggestions({
  selectedLocation,
  currentActivity,
  onActivityAdd
}: ActivitySuggestionsProps) {
  if (!selectedLocation) {
    return null;
  }

  const handleActivityClick = (activity: string) => {
    // Add the activity to the current text
    const currentText = currentActivity.trim();
    let newText = '';
    
    if (currentText) {
      // If there's existing text, add with a comma separator
      newText = currentText + ', ' + activity;
    } else {
      // If no existing text, just add the activity
      newText = activity;
    }
    
    onActivityAdd(newText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{selectedLocation.emoji}</span>
        <h3 className="text-sm font-medium text-gray-700">
          Superhero activities at {selectedLocation.label}:
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedLocation.suggestedActivities.map((activity, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleActivityClick(activity)}
            className="group flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 px-3 py-2 rounded-lg text-sm border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs leading-tight">{activity}</span>
            <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-purple-600 transition-colors">
              +
            </div>
          </motion.button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        💡 Click any activity to add it to your description, or type your own!
      </p>
    </motion.div>
  );
}