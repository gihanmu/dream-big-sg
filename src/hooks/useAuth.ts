import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  isLoading: boolean;
}

/**
 * SSR-safe authentication hook that prevents hydration mismatches
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isFirstLogin: true,
    isLoading: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('dreamBigAuth') === 'authenticated';
      const isFirstLogin = !localStorage.getItem('dreamBigLoginTime');
      
      setAuthState({
        isAuthenticated,
        isFirstLogin,
        isLoading: false
      });
    }
  }, []);

  return authState;
}