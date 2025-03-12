import { useState, useEffect, useRef } from 'react';
import { LocationError } from './locationUtils';
import { logger } from '../../services/logging';

/**
 * Hook to check if geolocation is supported by the browser
 * @returns Object containing isSupported flag and error if not supported
 */
export const useGeolocationSupport = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);
  const checkAttemptsRef = useRef(0);
  const maxCheckAttempts = 3;
  const initialDelayMs = 1000; // 1 second initial delay

  useEffect(() => {
    // Function to check geolocation support
    const checkGeolocationSupport = () => {
      // Check if geolocation is supported
      if (navigator.geolocation) {
        console.log('Geolocation is supported by this browser');
        setIsSupported(true);
        setError(null);
        return true;
      } else {
        checkAttemptsRef.current++;
        console.error(`Geolocation is not supported by this browser (attempt ${checkAttemptsRef.current} of ${maxCheckAttempts})`);
        
        if (checkAttemptsRef.current < maxCheckAttempts) {
          // Schedule another check with increasing delay
          const retryDelay = initialDelayMs * (checkAttemptsRef.current + 1);
          console.log(`Will retry geolocation check in ${retryDelay}ms`);
          
          setTimeout(checkGeolocationSupport, retryDelay);
          return false;
        } else {
          // Max attempts reached, set error state
          logger.warning('Geolocation not supported after max check attempts', 'useGeolocationSupport');
          setError({
            message: 'Geolocation is not supported by this browser'
          });
          setIsSupported(false);
          return false;
        }
      }
    };

    // Add a delay to allow browser to initialize
    const timer = setTimeout(() => {
      checkGeolocationSupport();
    }, initialDelayMs);
    
    return () => clearTimeout(timer);
  }, []);

  return { isSupported, error };
};
