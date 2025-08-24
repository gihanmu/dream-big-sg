
import { LOCATION_OPTIONS } from '@/lib/locations';
import { getAllCareers } from '@/lib/careers';

export interface PosterData {
  career: string;
  background: string;
  activity: string;
  childName?: string;
}


// Helper function to get detailed location descriptions for better AI understanding
function getLocationDetails(locationValue: string): { name: string; description: string; landmarks: string } {
  const locationMap: Record<string, { name: string; description: string; landmarks: string }> = {
    'gardens-by-the-bay': {
      name: 'Gardens by the Bay',
      description: 'Singapore\'s futuristic botanical wonderland',
      landmarks: 'Supertree Grove with towering tree-like structures, Cloud Forest dome, Flower Dome conservatory'
    },
    'marina-bay-sands': {
      name: 'Marina Bay Sands',
      description: 'Singapore\'s iconic luxury resort and casino',
      landmarks: 'three connected towers with infinity pool on top, unique boat-shaped SkyPark, Marina Bay waterfront'
    },
    'jewel-changi': {
      name: 'Jewel Changi Airport',
      description: 'World-class airport entertainment complex',
      landmarks: 'Rain Vortex indoor waterfall, lush indoor forest, glass dome architecture'
    },
    'sentosa-island': {
      name: 'Sentosa Island',
      description: 'Singapore\'s premier resort island',
      landmarks: 'pristine beaches, Universal Studios theme park, cable car system, Merlion statue'
    },
    'botanic-gardens': {
      name: 'Singapore Botanic Gardens',
      description: 'UNESCO World Heritage botanical garden',
      landmarks: 'National Orchid Garden, Swan Lake, heritage trees, tropical rainforest'
    },
    'singapore-flyer': {
      name: 'Singapore Flyer',
      description: 'Giant observation wheel with panoramic city views',
      landmarks: 'giant ferris wheel, Marina Bay skyline, Singapore River, cityscape views'
    },
    'merlion-park': {
      name: 'Merlion Park',
      description: 'Home to Singapore\'s iconic national symbol',
      landmarks: 'Merlion statue spouting water, Marina Bay backdrop, Singapore skyline, waterfront promenade'
    },
    'national-gallery': {
      name: 'National Gallery Singapore',
      description: 'Premier visual arts institution',
      landmarks: 'neoclassical architecture, Supreme Court and City Hall buildings, cultural district'
    },
    'random-place': {
      name: 'Singapore',
      description: 'vibrant multicultural city-state',
      landmarks: 'modern skyline, tropical architecture, urban gardens, cultural landmarks'
    }
  };
  
  return locationMap[locationValue] || locationMap['random-place'];
}

export function generateImagenPrompt(data: PosterData): string {
  const locationDetails = getLocationDetails(data.background);
  
  // Adaptive prompt that works for both children and adults
  // Note: The API will determine age from photo analysis and adjust accordingly
  return `Create an inspiring professional superhero poster showing [1] as a successful ${data.career} ${data.activity} at ${locationDetails.name} in Singapore. 
Transform appropriately: For young users, show their future adult self (age 25-30). For adult users, show superhero version at current age.
The scene features ${locationDetails.landmarks} with modern/futuristic elements as appropriate.
[1] wears professional ${data.career} attire with suitable equipment, showing confidence and success.
Style: Inspirational superhero poster - for kids showing "your future self", for adults showing "your superhero professional self".
Preserve facial identity while applying appropriate transformation (aging for kids, enhancement for adults).
Setting should feature recognizable Singapore landmarks with enhancement appropriate to the subject's transformation.`;
}

export const CAREER_OPTIONS = [
  { value: 'doctor', label: 'Doctor/Nurse', emoji: '🧑‍⚕️' },
  { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫' },
  { value: 'engineer', label: 'Engineer/Builder', emoji: '🧑‍🔧' },
  { value: 'scientist', label: 'Scientist/Researcher', emoji: '🧑‍🔬' },
  { value: 'firefighter', label: 'Firefighter', emoji: '🧑‍🚒' },
  { value: 'pilot', label: 'Pilot', emoji: '🧑‍✈️' },
  { value: 'programmer', label: 'Programmer', emoji: '🧑‍💻' },
  { value: 'cleaner', label: 'Cleaner/Maintenance', emoji: '🧹' },
  { value: 'transport', label: 'Transport Staff', emoji: '🚌' }
];

export const BACKGROUND_OPTIONS = [
  { value: 'gardens-by-the-bay', label: 'Gardens by the Bay' },
  { value: 'marina-bay-sands', label: 'Marina Bay Sands' },
  { value: 'universal-studios', label: 'Universal Studios Singapore' },
  { value: 'singapore-flyer', label: 'Singapore Flyer' },
  { value: 'changi-airport', label: 'Changi Airport' }
];

// Helper functions to convert internal values to display names
export function getCareerDisplayName(careerValue: string): string {
  // Check in all careers (including custom ones)
  const allCareers = getAllCareers();
  const career = allCareers.find(c => c.value === careerValue);
  return career?.label || careerValue.charAt(0).toUpperCase() + careerValue.slice(1);
}

export function getLocationDisplayName(locationValue: string): string {
  const location = LOCATION_OPTIONS.find(l => l.value === locationValue);
  return location?.label || locationValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}