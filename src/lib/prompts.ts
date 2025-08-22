
import { LOCATION_OPTIONS } from '@/lib/locations';
import { BASE_CAREER_OPTIONS } from '@/lib/careers';

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
  
  // Always use image-editing prompt since camera photo is required
  return `Create a professional poster showing [1] as a ${data.career} ${data.activity} at ${locationDetails.name} in Singapore. The scene must prominently feature the iconic ${locationDetails.landmarks} in the background. [1] should wear appropriate ${data.career} attire and equipment. Style: Vibrant, inspirational superhero poster with bright colors and dynamic composition. The Singapore landmark ${locationDetails.name} must be immediately recognizable with clear details of ${locationDetails.landmarks}. Professional photography quality, poster-worthy composition.`;
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
  const career = BASE_CAREER_OPTIONS.find(c => c.value === careerValue);
  return career?.label || careerValue.charAt(0).toUpperCase() + careerValue.slice(1);
}

export function getLocationDisplayName(locationValue: string): string {
  const location = LOCATION_OPTIONS.find(l => l.value === locationValue);
  return location?.label || locationValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}