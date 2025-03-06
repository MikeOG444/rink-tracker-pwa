import { useState, useCallback, useRef } from 'react';
import { LocationState, LocationError, LocationOptions, defaultLocationOptions } from './locationUtils';

interface UseBrowserGeolocationProps {
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
  options?: LocationOptions;
}

/**
 * Hook to handle browser geolocation API
 */
export const useBrowserGeolocation = ({
  onSuccess,
  onError,
  options = defaultLocationOptions
}: UseBrowserGeolocationProps = {}) => {
  const [state, setState] = useState<LocationState>(LocationState.IDLE);
  const [error, setError] = useState<LocationError | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Function to request browser location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(LocationState.ERROR);
      setError({ message: 'Geolocation is not supported by this browser' });
      return;
    }
    
    setState(LocationState.LOCATING);
    setError(null);
    
    try {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          if (!isMounted.current) return;
          
          console.log('Geolocation success callback fired');
          setPosition(position);
          setState(LocationState.SUCCESS);
          
          if (onSuccess) {
            onSuccess(position);
          }
        },
        // Error callback
        (error) => {
          if (!isMounted.current) return;
          
          console.error('Geolocation error:', error.code, error.message);
          setError({
            code: error.code,
            message: error.message
          });
          setState(LocationState.ERROR);
          
          if (onError) {
            onError(error);
          }
        },
        // Options
        options as PositionOptions
      );
    } catch (e) {
      console.error('Exception in geolocation request:', e);
      setState(LocationState.ERROR);
      setError({ message: 'Exception in geolocation request' });
    }
  }, [onSuccess, onError, options]);
  
  // Function to reset state
  const reset = useCallback(() => {
    setState(LocationState.IDLE);
    setError(null);
    setPosition(null);
  }, []);
  
  // Clean up on unmount
  const cleanup = useCallback(() => {
    isMounted.current = false;
  }, []);
  
  return {
    state,
    error,
    position,
    requestLocation,
    reset,
    cleanup,
    isLocating: state === LocationState.LOCATING,
    isSuccess: state === LocationState.SUCCESS,
    isError: state === LocationState.ERROR
  };
};
