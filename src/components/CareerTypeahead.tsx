'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerOption, getAllCareers, getPopularCareers, searchCareers } from '@/lib/careers';
import { useDebounce } from '@/lib/search-utils';

interface CareerTypeaheadProps {
  value: string;
  onChange: (career: CareerOption | null) => void;
  onRequestCustomCareer: (searchTerm: string) => void;
  error?: string;
}

export default function CareerTypeahead({ value, onChange, onRequestCustomCareer, error }: CareerTypeaheadProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCareers, setFilteredCareers] = useState<CareerOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get popular careers for quick selection
  const popularCareers = useMemo(() => getPopularCareers(), []);
  const popularCareerValues = useMemo(() => popularCareers.map(c => c.value), [popularCareers]);

  // Get all careers on mount (excluding popular ones to avoid duplication)
  useEffect(() => {
    const allCareers = getAllCareers();
    const nonPopularCareers = allCareers.filter(career => !popularCareerValues.includes(career.value));
    setFilteredCareers(nonPopularCareers.slice(0, 12)); // Show first 12 non-popular careers by default
  }, [popularCareerValues]);

  // Debounced search function
  const performSearch = useCallback((term: string) => {
    const allCareers = getAllCareers();
    let results = searchCareers(term, allCareers);
    
      // Exclude popular careers from dropdown to avoid duplication
    results = results.filter(career => !popularCareerValues.includes(career.value));
    
    setFilteredCareers(results.slice(0, 20)); // Limit to 20 results
    setSelectedIndex(-1);
  }, [popularCareerValues]);

  const debouncedSearch = useDebounce(performSearch, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowDropdown(true);
    debouncedSearch(term);
  };

  // Handle career selection
  const handleCareerSelect = (career: CareerOption) => {
    onChange(career);
    setSearchTerm(career.label);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, filteredCareers.length) // +1 for "Add custom" option
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === filteredCareers.length) {
          // Selected "Add custom" option
          handleAddCustomCareer();
        } else if (selectedIndex >= 0 && filteredCareers[selectedIndex]) {
          handleCareerSelect(filteredCareers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle adding custom career
  const handleAddCustomCareer = () => {
    onRequestCustomCareer(searchTerm);
    setShowDropdown(false);
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="space-y-6">
      {/* Search Section - Now on Top */}
      <div className="relative">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Search Careers 🔍
        </h3>
        
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            placeholder="Type to search for careers... (e.g., software engineer, marine biologist, chef)"
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
              error ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: showDropdown ? 180 : 0 }}
              className="text-gray-400"
            >
              ⌄
            </motion.div>
          </div>
        </div>

        {/* Dropdown Results */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100"
            >
              {filteredCareers.length > 0 ? (
                <>
                  {filteredCareers.map((career, index) => (
                    <motion.button
                      key={career.value}
                      onClick={() => handleCareerSelect(career)}
                      className={`w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 transition-colors ${
                        selectedIndex === index ? 'bg-purple-100' : ''
                      }`}
                      whileHover={{ backgroundColor: '#faf5ff' }}
                    >
                      <span className="text-3xl">{career.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{career.label}</div>
                        <div className="text-xs text-gray-500">{career.category}</div>
                      </div>
                      {career.isCustom && (
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Custom
                        </div>
                      )}
                    </motion.button>
                  ))}
                  
                  {searchTerm.trim() && (
                    <motion.button
                      onClick={handleAddCustomCareer}
                      className={`w-full px-4 py-3 text-left hover:bg-green-50 flex items-center space-x-3 border-t border-gray-200 transition-colors ${
                        selectedIndex === filteredCareers.length ? 'bg-green-100' : ''
                      }`}
                      whileHover={{ backgroundColor: '#f0fdf4' }}
                    >
                      <span className="text-xl">➕</span>
                      <div className="flex-1">
                        <div className="font-medium text-green-700">
                          Add &quot;{searchTerm}&quot; as a new career
                        </div>
                        <div className="text-xs text-green-600">
                          Create your own custom career path
                        </div>
                      </div>
                    </motion.button>
                  )}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <div className="text-3xl mb-2">🔍</div>
                  <div>No careers found</div>
                  {searchTerm.trim() && (
                    <button
                      onClick={handleAddCustomCareer}
                      className="mt-3 text-green-600 hover:text-green-700 font-medium"
                    >
                      Add &quot;{searchTerm}&quot; as custom career
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Popular Careers Grid - Now Below Search */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Popular Careers 🌟
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularCareers.map((career) => (
            <motion.button
              key={career.value}
              onClick={() => handleCareerSelect(career)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-center min-h-[160px] flex flex-col justify-center ${
                value === career.value
                  ? 'border-purple-500 bg-purple-100 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-6xl mb-3">{career.emoji}</div>
              <div className="font-bold text-base text-gray-800">{career.label}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}