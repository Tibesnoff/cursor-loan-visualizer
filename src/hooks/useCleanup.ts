import { useRef, useEffect } from 'react';
import { createCleanupFunction } from '../utils/memoryUtils';

/**
 * Shared hook for cleanup management
 * Reduces duplication of cleanup function patterns across hooks
 */
export const useCleanup = () => {
  const cleanup = useRef(createCleanupFunction());

  useEffect(() => {
    const cleanupFn = cleanup.current;
    return () => {
      cleanupFn.cleanup();
    };
  }, []);

  return cleanup.current;
};
