export interface PosterData {
  career: string;
  background: string;
  activity: string;
  childName?: string;
  childAppearance?: string;
}

export function generateImagenPrompt(data: PosterData): string {
  // Generate professional poster with seamless photo integration
  
  if (data.childAppearance?.includes('selfie')) {
    // When user has uploaded a photo, use image editing language
    return `Edit this photo to transform the scene while preserving the person's identity completely. 

KEEP UNCHANGED:
- The person's face, facial features, and identity exactly as shown
- Their skin tone, hair, and natural appearance
- Their body proportions and build

EDIT TO CHANGE:
- Outfit: Replace current clothing with professional ${data.career} attire and equipment
- Background: Place them at ${data.background} in Singapore with recognizable landmarks
- Context: Show them actively ${data.activity} in a professional setting
- Lighting: Adjust to match the new environment naturally

Style: Photorealistic editing that looks seamless and natural. The result should appear as if this person was originally photographed as a ${data.career} at ${data.background}. Make it inspirational and professional.`;
  }
  
  // When no photo uploaded, generate complete scene with character
  return `Create a vibrant illustration of a professional ${data.career} at ${data.background} in Singapore, ${data.activity}. Show a confident person in appropriate ${data.career} attire with the iconic ${data.background} clearly visible in the background. Style: Professional, inspirational poster with bright colors and dynamic composition.`;
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