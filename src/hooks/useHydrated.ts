import { useState, useEffect } from 'react';

/**
 * Hook to track if component has hydrated on client side
 * Useful for avoiding hydration mismatches with browser-only code
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}