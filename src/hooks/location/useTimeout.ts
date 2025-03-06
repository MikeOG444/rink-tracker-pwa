import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to handle timeout management
 */
export const useTimeout = () => {
  const timeoutRef = useRef<number | null>(null);

  // Function to clear any existing timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      console.log('Clearing existing timeout');
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return true;
    }
    return false;
  }, []);

  // Function to set a new timeout
  const setTimeout = useCallback((callback: () => void, delay: number) => {
    // Clear any existing timeout first
    clearTimeout();
    
    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      callback();
    }, delay);
    
    return timeoutRef.current;
  }, [clearTimeout]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeout();
    };
  }, [clearTimeout]);

  return {
    setTimeout,
    clearTimeout,
    hasActiveTimeout: timeoutRef.current !== null
  };
};
