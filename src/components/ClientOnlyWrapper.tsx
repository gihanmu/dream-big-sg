'use client';

import { useHydrated } from '@/hooks/useHydrated';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that only renders children on client side
 * Useful for components that use browser APIs or have hydration issues
 */
export default function ClientOnlyWrapper({ 
  children, 
  fallback = null 
}: ClientOnlyWrapperProps) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}