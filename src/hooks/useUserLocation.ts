import { useState, useCallback, useEffect, useRef } from 'react';
import { LocationState, LocationError, defaultCenter, areLocationsSignificantlyDifferent } from './location/locationUtils';
import { useGeolocationSupport } from './location/useGeolocationSupport';
import { useBrowserGeolocation } from './location/useBrowserGeolocation';
import { useMapCenter } from './location/useMapCenter';
import { useTimeout } from './location/useTimeout';
import { LocationPreferences } from '../services/location/LocationPreferences';
import { logger } from '../services/logging';

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
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Custom hooks
  const { isSupported: isGeolocationSupported } = useGeolocationSupport();
  const { centerMapOnLocation } = useMapCenter({ map });
  const { setTimeout, clearTimeout } = useTimeout();
  
  // Ref to track retry attempts
  const retryAttemptsRef = useRef(0);
  const maxRetryAttempts = 3;
  
  // Browser geolocation hook
  const browserGeolocation = useBrowserGeolocation({
    onSuccess: (position) => {
      if (!isMounted.current) return;
      
      const browserPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log('Got browser location:', browserPos.lat, browserPos.lng);
      
      // Clear any error state since we successfully got the location
      if (error) {
        console.log('Clearing previous geolocation error');
        setError(null);
      }
      
      // Reset retry counter on success
      retryAttemptsRef.current = 0;
      
      // Only update if we don't have a location yet or if it's significantly different
      if (!userLocation || areLocationsSignificantlyDifferent(browserPos, userLocation)) {
        console.log('Browser location is different, updating');
        setUserLocation(browserPos);
        centerMapOnLocation(browserPos);
      }
      
      // Update location state to success
      setLocationState(LocationState.SUCCESS);
    },
    onError: (error) => {
      console.error('Geolocation error:', error.code, error.message);
      
      // If we already have a location, we can ignore this error
      if (userLocation) {
        console.log('Already have a location, ignoring geolocation error');
        return;
      }
      
      // Check if we should retry
      if (retryAttemptsRef.current < maxRetryAttempts) {
        retryAttemptsRef.current++;
        console.log(`Retrying geolocation (attempt ${retryAttemptsRef.current} of ${maxRetryAttempts})...`);
        
        // Add a delay before retrying
        setTimeout(() => {
          if (isMounted.current) {
            browserGeolocation.requestLocation();
          }
        }, 1000); // 1 second delay between retries
        
        return;
      }
      
      // Max retries reached, set error state
      logger.warning('Geolocation failed after max retry attempts', 'useUserLocation', { 
        errorCode: error.code, 
        errorMessage: error.message 
      });
      
      setError({
        code: error.code,
        message: error.message
      });
      setLocationState(LocationState.ERROR);
    }
  });
  
  /**
   * Function to get user's current location
   * Uses a state machine approach to handle different states
   */
  const getUserLocation = useCallback(() => {
    console.log('getUserLocation called, locationState:', locationState);
    
    // Clear any existing timeout
    clearTimeout();
    
    // Reset retry counter
    retryAttemptsRef.current = 0;
    
    // If already locating, don't do anything
    if (locationState === LocationState.LOCATING) {
      console.log('Already locating, skipping request');
      return;
    }
    
    // Reset error state
    setError(null);
    setLocationState(LocationState.LOCATING);
    
    // Check if geolocation is supported
    if (!isGeolocationSupported) {
      console.log('Geolocation is not supported by this browser');
      
      // Double-check by trying to access navigator.geolocation directly
      // This helps in cases where the hook's state might be out of sync
      if (navigator.geolocation) {
        console.log('Navigator.geolocation is actually available, proceeding with location request');
        browserGeolocation.requestLocation();
        return;
      }
      
      // If we get here, geolocation is truly not supported
      setError({ message: 'Geolocation is not supported by this browser' });
      setLocationState(LocationState.ERROR);
      
      // Try to use saved default location first
      const savedLocation = LocationPreferences.getDefaultLocation();
      if (savedLocation) {
        console.log('Using saved default location:', savedLocation);
        setUserLocation(savedLocation);
        centerMapOnLocation(savedLocation);
      } else {
        // Fall back to default location
        console.log('No saved location, falling back to default location');
        setUserLocation(defaultCenter);
        centerMapOnLocation(defaultCenter);
      }
      return;
    }
    
    // Use browser geolocation
    browserGeolocation.requestLocation();
  }, [
    locationState, 
    clearTimeout, 
    isGeolocationSupported, 
    centerMapOnLocation, 
    browserGeolocation
  ]);

  /**
   * Handle "My Location" button click
   * Forces a new location request
   */
  const handleMyLocationClick = useCallback(() => {
    console.log('My Location button clicked');
    
    // Force a new location request
    setLocationState(LocationState.IDLE);
    setError(null); // Clear any existing error
    
    // We don't clear userLocation here to avoid map jumping
    // Only clear it if we successfully get a new location
    
    // Add a small delay to ensure state is updated before calling getUserLocation
    setTimeout(() => {
      console.log('Requesting user location after button click');
      getUserLocation();
    }, 100);
  }, [getUserLocation, setTimeout]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting');
      isMounted.current = false;
      browserGeolocation.cleanup();
      clearTimeout();
    };
  }, [browserGeolocation, clearTimeout]);

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
    setUserLocation(location);
    centerMapOnLocation(location);
    setLocationState(LocationState.SUCCESS);
    
    // Clear any error state since we now have a valid location
    if (error) {
      setError(null);
    }
  }, [centerMapOnLocation, error]);

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
    setManualLocation
  };
};
