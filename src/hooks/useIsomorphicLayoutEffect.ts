import { useEffect, useLayoutEffect } from 'react';

/**
 * Use useLayoutEffect on client side, useEffect on server side
 * Prevents SSR warnings about useLayoutEffect
 */
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;