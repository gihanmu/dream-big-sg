import { create } from 'zustand';
import { PosterData } from './prompts';

export interface GeneratedPoster {
  id: string;
  imageUrl: string;
  data: PosterData;
  createdAt: string;
  badges?: string[];
}

interface AppState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  currentPosterData: Partial<PosterData>;
  generatedPosters: GeneratedPoster[];
  soundEnabled: boolean;
  
  // Actions
  setAuthenticated: (auth: boolean, firstLogin?: boolean) => void;
  updatePosterData: (data: Partial<PosterData>) => void;
  addGeneratedPoster: (poster: GeneratedPoster) => void;
  loadPostersFromStorage: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  clearPosterData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isFirstLogin: false,
  currentPosterData: {},
  generatedPosters: [],
  soundEnabled: true,

  setAuthenticated: (auth: boolean, firstLogin = false) => {
    set({ 
      isAuthenticated: auth, 
      isFirstLogin: firstLogin 
    });
  },

  updatePosterData: (data: Partial<PosterData>) => {
    set(state => ({
      currentPosterData: { ...state.currentPosterData, ...data }
    }));
  },

  addGeneratedPoster: (poster: GeneratedPoster) => {
    const posters = [...get().generatedPosters, poster];
    set({ generatedPosters: posters });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamBigPosters', JSON.stringify(posters));
    }
  },

  loadPostersFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dreamBigPosters');
        const soundSetting = localStorage.getItem('dreamBigSoundEnabled');
        
        if (stored) {
          const posters = JSON.parse(stored);
          set({ generatedPosters: posters });
        }
        
        if (soundSetting !== null) {
          set({ soundEnabled: soundSetting === 'true' });
        }
      } catch (error) {
        console.error('Failed to load from storage:', error);
      }
    }
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamBigSoundEnabled', enabled.toString());
    }
  },

  clearPosterData: () => {
    set({ currentPosterData: {} });
  }
}));