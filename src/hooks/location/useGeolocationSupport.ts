import { useState, useEffect } from 'react';
import { LocationError } from './locationUtils';

/**
 * Hook to check if geolocation is supported by the browser
 * @returns Object containing isSupported flag and error if not supported
 */
export const useGeolocationSupport = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setError({
        message: 'Geolocation is not supported by this browser'
      });
      setIsSupported(false);
    } else {
      setIsSupported(true);
      setError(null);
    }
  }, []);

  return { isSupported, error };
};
