export interface CareerOption {
  value: string;
  label: string;
  emoji: string;
  category: string;
  isCustom?: boolean;
}

export const CAREER_CATEGORIES = {
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education', 
  TECHNOLOGY: 'Technology',
  SAFETY: 'Safety & Security',
  TRANSPORT: 'Transportation',
  CREATIVE: 'Creative Arts',
  FOOD: 'Food & Hospitality',
  BUSINESS: 'Business & Finance',
  SCIENCE: 'Science & Research',
  SPORTS: 'Sports & Fitness',
  ENTERTAINMENT: 'Entertainment',
  SERVICE: 'Service Industry',
  ENVIRONMENT: 'Environment',
  LEGAL: 'Legal & Government',
  ENGINEERING: 'Engineering & Construction'
};

export const BASE_CAREER_OPTIONS: CareerOption[] = [
  // Healthcare
  { value: 'doctor', label: 'Doctor', emoji: '🧑‍⚕️', category: CAREER_CATEGORIES.HEALTHCARE },
  { value: 'nurse', label: 'Nurse', emoji: '👩‍⚕️', category: CAREER_CATEGORIES.HEALTHCARE },
  { value: 'paramedic', label: 'Paramedic', emoji: '🚑', category: CAREER_CATEGORIES.HEALTHCARE },
  { value: 'dentist', label: 'Dentist', emoji: '🦷', category: CAREER_CATEGORIES.HEALTHCARE },
  { value: 'veterinarian', label: 'Veterinarian', emoji: '🐾', category: CAREER_CATEGORIES.HEALTHCARE },
  { value: 'pharmacist', label: 'Pharmacist', emoji: '💊', category: CAREER_CATEGORIES.HEALTHCARE },

  // Education
  { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫', category: CAREER_CATEGORIES.EDUCATION },
  { value: 'professor', label: 'Professor', emoji: '👨‍🎓', category: CAREER_CATEGORIES.EDUCATION },
  { value: 'librarian', label: 'Librarian', emoji: '📚', category: CAREER_CATEGORIES.EDUCATION },
  { value: 'tutor', label: 'Private Tutor', emoji: '📝', category: CAREER_CATEGORIES.EDUCATION },

  // Technology
  { value: 'programmer', label: 'Programmer', emoji: '🧑‍💻', category: CAREER_CATEGORIES.TECHNOLOGY },
  { value: 'software-engineer', label: 'Software Engineer', emoji: '👨‍💻', category: CAREER_CATEGORIES.TECHNOLOGY },
  { value: 'data-scientist', label: 'Data Scientist', emoji: '📊', category: CAREER_CATEGORIES.TECHNOLOGY },
  { value: 'game-developer', label: 'Game Developer', emoji: '🎮', category: CAREER_CATEGORIES.TECHNOLOGY },
  { value: 'ai-engineer', label: 'AI Engineer', emoji: '🤖', category: CAREER_CATEGORIES.TECHNOLOGY },
  { value: 'web-designer', label: 'Web Designer', emoji: '💻', category: CAREER_CATEGORIES.TECHNOLOGY },

  // Safety & Security
  { value: 'firefighter', label: 'Firefighter', emoji: '🧑‍🚒', category: CAREER_CATEGORIES.SAFETY },
  { value: 'police-officer', label: 'Police Officer', emoji: '👮‍♀️', category: CAREER_CATEGORIES.SAFETY },
  { value: 'security-guard', label: 'Security Guard', emoji: '🛡️', category: CAREER_CATEGORIES.SAFETY },
  { value: 'lifeguard', label: 'Lifeguard', emoji: '🏊‍♀️', category: CAREER_CATEGORIES.SAFETY },

  // Transportation
  { value: 'pilot', label: 'Pilot', emoji: '🧑‍✈️', category: CAREER_CATEGORIES.TRANSPORT },
  { value: 'bus-driver', label: 'Bus Driver', emoji: '🚌', category: CAREER_CATEGORIES.TRANSPORT },
  { value: 'mrt-captain', label: 'MRT Captain', emoji: '🚊', category: CAREER_CATEGORIES.TRANSPORT },
  { value: 'taxi-driver', label: 'Taxi Driver', emoji: '🚕', category: CAREER_CATEGORIES.TRANSPORT },
  { value: 'ship-captain', label: 'Ship Captain', emoji: '🚢', category: CAREER_CATEGORIES.TRANSPORT },
  { value: 'flight-attendant', label: 'Flight Attendant', emoji: '✈️', category: CAREER_CATEGORIES.TRANSPORT },

  // Creative Arts
  { value: 'artist', label: 'Artist', emoji: '🎨', category: CAREER_CATEGORIES.CREATIVE },
  { value: 'musician', label: 'Musician', emoji: '🎵', category: CAREER_CATEGORIES.CREATIVE },
  { value: 'designer', label: 'Designer', emoji: '🖌️', category: CAREER_CATEGORIES.CREATIVE },
  { value: 'photographer', label: 'Photographer', emoji: '📸', category: CAREER_CATEGORIES.CREATIVE },
  { value: 'animator', label: 'Animator', emoji: '🎬', category: CAREER_CATEGORIES.CREATIVE },
  { value: 'writer', label: 'Writer', emoji: '✍️', category: CAREER_CATEGORIES.CREATIVE },

  // Food & Hospitality
  { value: 'chef', label: 'Chef', emoji: '🍳', category: CAREER_CATEGORIES.FOOD },
  { value: 'baker', label: 'Baker', emoji: '🧁', category: CAREER_CATEGORIES.FOOD },
  { value: 'food-scientist', label: 'Food Scientist', emoji: '🔬', category: CAREER_CATEGORIES.FOOD },
  { value: 'hotel-manager', label: 'Hotel Manager', emoji: '🏨', category: CAREER_CATEGORIES.FOOD },

  // Science & Research
  { value: 'scientist', label: 'Scientist', emoji: '🧑‍🔬', category: CAREER_CATEGORIES.SCIENCE },
  { value: 'marine-biologist', label: 'Marine Biologist', emoji: '🐠', category: CAREER_CATEGORIES.SCIENCE },
  { value: 'astronomer', label: 'Astronomer', emoji: '🔭', category: CAREER_CATEGORIES.SCIENCE },
  { value: 'archaeologist', label: 'Archaeologist', emoji: '🏺', category: CAREER_CATEGORIES.SCIENCE },

  // Engineering & Construction
  { value: 'engineer', label: 'Engineer', emoji: '🧑‍🔧', category: CAREER_CATEGORIES.ENGINEERING },
  { value: 'architect', label: 'Architect', emoji: '🏗️', category: CAREER_CATEGORIES.ENGINEERING },
  { value: 'construction-worker', label: 'Construction Worker', emoji: '👷‍♀️', category: CAREER_CATEGORIES.ENGINEERING },
  { value: 'mechanic', label: 'Mechanic', emoji: '🔧', category: CAREER_CATEGORIES.ENGINEERING },

  // Business & Finance
  { value: 'banker', label: 'Banker', emoji: '🏦', category: CAREER_CATEGORIES.BUSINESS },
  { value: 'accountant', label: 'Accountant', emoji: '🧮', category: CAREER_CATEGORIES.BUSINESS },
  { value: 'entrepreneur', label: 'Business Owner', emoji: '💼', category: CAREER_CATEGORIES.BUSINESS },
  { value: 'salesperson', label: 'Sales Person', emoji: '🛍️', category: CAREER_CATEGORIES.BUSINESS },

  // Sports & Fitness
  { value: 'athlete', label: 'Professional Athlete', emoji: '🏃‍♀️', category: CAREER_CATEGORIES.SPORTS },
  { value: 'coach', label: 'Sports Coach', emoji: '🏆', category: CAREER_CATEGORIES.SPORTS },
  { value: 'gym-trainer', label: 'Fitness Trainer', emoji: '💪', category: CAREER_CATEGORIES.SPORTS },

  // Entertainment
  { value: 'actor', label: 'Actor/Actress', emoji: '🎭', category: CAREER_CATEGORIES.ENTERTAINMENT },
  { value: 'singer', label: 'Singer', emoji: '🎤', category: CAREER_CATEGORIES.ENTERTAINMENT },
  { value: 'magician', label: 'Magician', emoji: '🎪', category: CAREER_CATEGORIES.ENTERTAINMENT },
  { value: 'youtuber', label: 'Content Creator', emoji: '📹', category: CAREER_CATEGORIES.ENTERTAINMENT },

  // Service Industry
  { value: 'cleaner', label: 'Cleaner', emoji: '🧹', category: CAREER_CATEGORIES.SERVICE },
  { value: 'hairdresser', label: 'Hairdresser', emoji: '💇‍♀️', category: CAREER_CATEGORIES.SERVICE },
  { value: 'delivery-person', label: 'Delivery Person', emoji: '📦', category: CAREER_CATEGORIES.SERVICE },

  // Environment
  { value: 'farmer', label: 'Farmer', emoji: '🌱', category: CAREER_CATEGORIES.ENVIRONMENT },
  { value: 'gardener', label: 'Gardener', emoji: '🌿', category: CAREER_CATEGORIES.ENVIRONMENT },
  { value: 'environmental-scientist', label: 'Environmental Scientist', emoji: '🌍', category: CAREER_CATEGORIES.ENVIRONMENT },

  // Legal & Government
  { value: 'lawyer', label: 'Lawyer', emoji: '⚖️', category: CAREER_CATEGORIES.LEGAL },
  { value: 'judge', label: 'Judge', emoji: '👨‍⚖️', category: CAREER_CATEGORIES.LEGAL },
  { value: 'politician', label: 'Government Official', emoji: '🏛️', category: CAREER_CATEGORIES.LEGAL }
];

/**
 * Get careers from localStorage and merge with base careers
 */
export function getAllCareers(): CareerOption[] {
  const baseCareerOptions = [...BASE_CAREER_OPTIONS];
  
  if (typeof window !== 'undefined') {
    try {
      const customCareers = localStorage.getItem('dreamBigCustomCareers');
      if (customCareers) {
        const parsed: CareerOption[] = JSON.parse(customCareers);
        return [...baseCareerOptions, ...parsed];
      }
    } catch (error) {
      console.error('Failed to load custom careers:', error);
    }
  }
  
  return baseCareerOptions;
}

/**
 * Save a custom career to localStorage
 */
export function saveCustomCareer(career: Omit<CareerOption, 'isCustom'>): void {
  if (typeof window !== 'undefined') {
    try {
      const existingCustom = localStorage.getItem('dreamBigCustomCareers');
      const customCareers: CareerOption[] = existingCustom ? JSON.parse(existingCustom) : [];
      
      const newCareer: CareerOption = { ...career, isCustom: true };
      customCareers.push(newCareer);
      
      localStorage.setItem('dreamBigCustomCareers', JSON.stringify(customCareers));
    } catch (error) {
      console.error('Failed to save custom career:', error);
    }
  }
}

/**
 * Search careers by label with fuzzy matching
 */
export function searchCareers(query: string, careers?: CareerOption[]): CareerOption[] {
  if (!query.trim()) return careers || getAllCareers();
  
  const searchTerms = query.toLowerCase().split(' ');
  const availableCareers = careers || getAllCareers();
  
  return availableCareers.filter(career => {
    const careerText = `${career.label} ${career.category}`.toLowerCase();
    return searchTerms.every(term => careerText.includes(term));
  }).sort((a, b) => {
    // Prioritize exact matches and custom careers
    const aExact = a.label.toLowerCase().includes(query.toLowerCase());
    const bExact = b.label.toLowerCase().includes(query.toLowerCase());
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    if (a.isCustom && !b.isCustom) return -1;
    if (!a.isCustom && b.isCustom) return 1;
    
    return a.label.localeCompare(b.label);
  });
}