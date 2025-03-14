import { useState, useCallback, useEffect, useRef } from 'react';
import { LocationState, LocationError, defaultCenter } from './location/locationUtils';
import { useBrowserGeolocation } from './location/useBrowserGeolocation';
import { useMapCenter } from './location/useMapCenter';
import { useTimeout } from './location/useTimeout';
import { LocationPreferences } from '../services/location/LocationPreferences';
import { logger } from '../services/logging';

// Create a global debug object if it doesn't exist
if (typeof window !== 'undefined') {
  if (!window.__RINK_TRACKER_DEBUG__) {
    window.__RINK_TRACKER_DEBUG__ = {};
  }
}

interface UseUserLocationProps {
  map?: google.maps.Map | null;
}

/**
 * Hook to handle user location detection and map centering
 */
export const useUserLocation = ({ 
  map = null
}: UseUserLocationProps = {}) => {
  // State
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationState, setLocationState] = useState<LocationState>(LocationState.IDLE);
  const [error, setError] = useState<LocationError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Custom hooks
  const { centerMapOnLocation } = useMapCenter({ map });
  const { setTimeout, clearTimeout } = useTimeout();
  
  // Configuration constants
  const maxRetryAttempts = 3;
  const globalTimeoutMs = 20000; // 20 seconds global timeout
  const retryDelayMs = 2000; // Base delay between retries (will increase with backoff)
  
  // Refs for tracking timeouts and retries
  const retryAttemptsRef = useRef(0);
  const globalTimeoutRef = useRef<number | null>(null);
  
  /**
   * Helper function to clear all timeouts
   */
  const clearAllTimeouts = useCallback(() => {
    // Clear custom timeout hook
    clearTimeout();
    
    // Clear global timeout if it exists
    if (globalTimeoutRef.current !== null) {
      window.clearTimeout(globalTimeoutRef.current);
      globalTimeoutRef.current = null;
    }
  }, [clearTimeout]);
  
  /**
   * Helper function to use fallback location
   */
  const useFallbackLocation = useCallback(() => {
    // Try to use saved default location first
    const savedLocation = LocationPreferences.getDefaultLocation();
    if (savedLocation) {
      console.log('Using saved default location:', savedLocation);
      setUserLocation(savedLocation);
      centerMapOnLocation(savedLocation);
      
      // Store in debug object
      if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
        window.__RINK_TRACKER_DEBUG__.fallbackLocation = savedLocation;
        window.__RINK_TRACKER_DEBUG__.usingFallback = true;
      }
      
      return true;
    } else {
      // Fall back to default location (Toronto)
      console.log('No saved location, falling back to default location (Toronto)');
      setUserLocation(defaultCenter);
      centerMapOnLocation(defaultCenter);
      
      // Store in debug object
      if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
        window.__RINK_TRACKER_DEBUG__.fallbackLocation = defaultCenter;
        window.__RINK_TRACKER_DEBUG__.usingFallback = true;
      }
      
      return true;
    }
  }, [centerMapOnLocation]);
  
  // Browser geolocation hook
  const browserGeolocation = useBrowserGeolocation({
    onSuccess: (position) => {
      if (!isMounted.current) return;
      
      // Clear all timeouts since we got a successful response
      clearAllTimeouts();
      
      const browserPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };
      
      console.log('Got browser location:', browserPos.lat, browserPos.lng, 'accuracy:', browserPos.accuracy, 'meters');
      
      // Store location in debug object
      if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
        window.__RINK_TRACKER_DEBUG__.userLocation = browserPos;
      }
      
      // Clear any error state since we successfully got the location
      if (error) {
        console.log('Clearing previous geolocation error');
        setError(null);
      }
      
      // Reset retry counter on success
      retryAttemptsRef.current = 0;
      setRetryCount(0);
      
      // Create a simplified version without accuracy for the map
      const mapPos = {
        lat: browserPos.lat,
        lng: browserPos.lng
      };
      
      // CRITICAL: Force update the user location regardless of previous state
      console.log('FORCE UPDATING location to:', mapPos.lat, mapPos.lng);
      setUserLocation(mapPos);
      
      // CRITICAL: Directly center the map on the new location
      centerMapOnLocation(mapPos);
      
      // Store map center in debug object
      if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
        window.__RINK_TRACKER_DEBUG__.mapCenter = mapPos;
      }
      
      // CRITICAL: Force update location state to success
      setLocationState(LocationState.SUCCESS);
      
      // CRITICAL: Log success for debugging
      console.log('✅ Location successfully updated and state set to SUCCESS');
    },
    onError: (error) => {
      if (!isMounted.current) return;
      
      console.error('Geolocation error:', error.code, error.message);
      
      // If we already have a location, we can ignore this error
      if (userLocation) {
        console.log('Already have a location, ignoring geolocation error');
        return;
      }
      
      // Check if we should retry
      if (retryAttemptsRef.current < maxRetryAttempts) {
        retryAttemptsRef.current++;
        setRetryCount(retryAttemptsRef.current);
        
        console.log(`Retrying geolocation (attempt ${retryAttemptsRef.current} of ${maxRetryAttempts})...`);
        
        // Add a delay before retrying with exponential backoff
        const backoffDelay = retryDelayMs * Math.pow(1.5, retryAttemptsRef.current - 1);
        console.log(`Waiting ${backoffDelay}ms before retry...`);
        
        setTimeout(() => {
          if (isMounted.current) {
            browserGeolocation.requestLocation();
          }
        }, backoffDelay);
        
        return;
      }
      
      // Max retries reached, set error state
      logger.warning('Geolocation failed after max retry attempts', 'useUserLocation', { 
        errorCode: error.code, 
        errorMessage: error.message 
      });
      
      // Clear global timeout since we're handling the error now
      if (globalTimeoutRef.current !== null) {
        window.clearTimeout(globalTimeoutRef.current);
        globalTimeoutRef.current = null;
      }
      
      // Set appropriate error message based on error code
      let errorMessage = error.message;
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
      } else if (error.code === 2) {
        errorMessage = 'Unable to determine your location. Please check your connection or try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setError({
        code: error.code,
        message: errorMessage
      });
      setLocationState(LocationState.ERROR);
      
      // Use fallback location automatically on error
      useFallbackLocation();
    }
  });
  
  /**
   * Function to get user's current location
   * Uses a state machine approach to handle different states
   */
  const getUserLocation = useCallback(() => {
    console.log('getUserLocation called, locationState:', locationState);
    
    // Clear any existing timeouts
    clearAllTimeouts();
    
    // Reset retry counter
    retryAttemptsRef.current = 0;
    setRetryCount(0);
    
    // If already locating, don't do anything
    if (locationState === LocationState.LOCATING) {
      console.log('Already locating, skipping request');
      return;
    }
    
    // Reset error state
    setError(null);
    setLocationState(LocationState.LOCATING);
    
    // Set a global timeout for the entire location acquisition process
    globalTimeoutRef.current = window.setTimeout(() => {
      console.log(`Global location timeout reached after ${globalTimeoutMs}ms`);
      
      // Only proceed if component is still mounted
      if (isMounted.current) {
        // Log the timeout
        logger.warning('Geolocation global timeout reached', 'useUserLocation');
        
        // Set error state
        setError({
          message: 'Location request timed out. Please try again or set your location manually.'
        });
        setLocationState(LocationState.ERROR);
        
        // Use fallback location automatically on timeout
        useFallbackLocation();
      }
    }, globalTimeoutMs);
    
    // Add a safety timeout to reset the location state if it gets stuck
    const safetyTimeoutMs = 10000; // 10 seconds
    const safetyTimeout = window.setTimeout(() => {
      // Check the current state directly to avoid closure issues
      if (isMounted.current) {
        console.log(`Safety timeout reached after ${safetyTimeoutMs}ms, checking location state`);
        
        // Use a function to get the latest state
        setLocationState(currentState => {
          if (currentState === LocationState.LOCATING) {
            console.log('Location state is still LOCATING, resetting to IDLE');
            return LocationState.IDLE;
          }
          return currentState;
        });
        
        // Try to use fallback location if we're still stuck
        if (!userLocation) {
          console.log('No location available after safety timeout, using fallback');
          useFallbackLocation();
        }
      }
    }, safetyTimeoutMs);
    
    // Add the safety timeout to the global timeout ref for cleanup
    const originalClearTimeout = window.clearTimeout;
    const originalTimeoutRef = globalTimeoutRef.current;
    globalTimeoutRef.current = {
      clear: () => {
        originalClearTimeout(originalTimeoutRef);
        originalClearTimeout(safetyTimeout);
      }
    } as any;
    
    // Direct check for geolocation support
    const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
    
    // Check if geolocation is supported
    if (!isGeolocationSupported) {
      console.log('Geolocation is not supported by this browser');
      
      // Set error state
      setError({ message: 'Geolocation is not supported by this browser' });
      setLocationState(LocationState.ERROR);
      
      // Use fallback location automatically if geolocation is not supported
      useFallbackLocation();
      
      return;
    }
    
    // Use browser geolocation
    browserGeolocation.requestLocation();
  }, [
    locationState, 
    clearAllTimeouts, 
    useFallbackLocation, 
    browserGeolocation
  ]);

  /**
   * Handle "My Location" button click
   * Forces a new location request
   */
  const handleMyLocationClick = useCallback(() => {
    console.log('My Location button clicked');
    
    // CRITICAL: Force reset all state
    clearAllTimeouts();
    
    // Force reset the location state to IDLE
    setLocationState(LocationState.IDLE);
    setError(null); // Clear any existing error
    
    // We don't clear userLocation here to avoid map jumping
    // Only clear it if we successfully get a new location
    
    // CRITICAL: Add a safety timeout to reset the loading state if it gets stuck
    const resetTimeout = window.setTimeout(() => {
      console.log('Safety timeout for My Location button reached');
      setLocationState(prevState => 
        prevState === LocationState.LOCATING ? LocationState.IDLE : prevState
      );
    }, 5000); // 5 second safety timeout
    
    // Add a small delay to ensure state is updated before calling getUserLocation
    setTimeout(() => {
      console.log('Requesting user location after button click');
      getUserLocation();
    }, 100);
    
    // Return a cleanup function to clear the safety timeout
    return () => {
      window.clearTimeout(resetTimeout);
    };
  }, [getUserLocation, setTimeout, clearAllTimeouts]);

  /**
   * Function to use default location and skip geolocation
   */
  const useDefaultLocation = useCallback(() => {
    console.log('Using default location by user choice');
    
    // Clear any existing timeouts
    clearAllTimeouts();
    
    // Reset state
    setError(null);
    
    // Use fallback location
    if (useFallbackLocation()) {
      setLocationState(LocationState.SUCCESS);
      
      // Log that we're using default location
      console.log('Successfully set default location');
    }
  }, [clearAllTimeouts, useFallbackLocation]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting');
      isMounted.current = false;
      browserGeolocation.cleanup();
      clearAllTimeouts();
    };
  }, [browserGeolocation, clearAllTimeouts]);

  /**
   * Save the current location as the default
   */
  const saveAsDefaultLocation = useCallback(() => {
    if (userLocation) {
      LocationPreferences.saveDefaultLocation(userLocation);
      return true;
    }
    return false;
  }, [userLocation]);

  /**
   * Set a manual location
   */
  const setManualLocation = useCallback((location: google.maps.LatLngLiteral) => {
    // Clear any existing timeouts
    clearAllTimeouts();
    
    setUserLocation(location);
    centerMapOnLocation(location);
    setLocationState(LocationState.SUCCESS);
    
    // Clear any error state since we now have a valid location
    if (error) {
      setError(null);
    }
    
    console.log('Successfully set manual location');
  }, [centerMapOnLocation, error, clearAllTimeouts]);

  // Request location on mount
  useEffect(() => {
    if (locationState === LocationState.IDLE) {
      // Use default location first to show the map immediately
      useFallbackLocation();
      
      // Then try to get the actual location
      getUserLocation();
    }
  }, [locationState, useFallbackLocation, getUserLocation]);

  return {
    userLocation,
    isLocating: locationState === LocationState.LOCATING,
    error: error ? error.message : null,
    getUserLocation,
    centerMapOnLocation,
    handleMyLocationClick,
    defaultCenter,
    locationState,
    saveAsDefaultLocation,
    setManualLocation,
    useDefaultLocation,
    retryCount,
    maxRetryAttempts,
    locationReady: true // Always return true to show the map
  };
};
