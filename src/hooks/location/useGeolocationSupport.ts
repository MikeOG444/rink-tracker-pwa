import { useState, useEffect } from 'react';
import { LocationError } from './locationUtils';

/**
 * Hook to check if geolocation is supported by the browser
 * Simplified to perform a single synchronous check
 * @returns Object containing isSupported flag and error if not supported
 */
export const useGeolocationSupport = () => {
  // Perform a direct check for geolocation support
  const directlySupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  
  const [isSupported] = useState<boolean>(directlySupported);
  const [error] = useState<LocationError | null>(
    !directlySupported 
      ? { message: 'Geolocation is not supported by this browser' }
      : null
  );

  // Log the result once on mount
  useEffect(() => {
    if (isSupported) {
      console.log('Geolocation is supported by this browser');
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  }, [isSupported]);

  return { isSupported, error };
};
