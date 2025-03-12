import { useState, useCallback, useEffect, useRef } from 'react';
import { LocationState, LocationError, defaultCenter, areLocationsSignificantlyDifferent } from './location/locationUtils';
import { useGeolocationSupport } from './location/useGeolocationSupport';
import { useBrowserGeolocation } from './location/useBrowserGeolocation';
import { useMapCenter } from './location/useMapCenter';
import { useTestLocation } from './location/useTestLocation';
import { useTimeout } from './location/useTimeout';
import { LocationPreferences } from '../services/location/LocationPreferences';
// Removed unused import

interface UseUserLocationProps {
  map?: google.maps.Map | null;
  useTestLocationInDev?: boolean;
}

/**
 * Hook to handle user location detection and map centering
 */
export const useUserLocation = ({ 
  map = null, 
  useTestLocationInDev = true 
}: UseUserLocationProps = {}) => {
  // State
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationState, setLocationState] = useState<LocationState>(LocationState.IDLE);
  const [error, setError] = useState<LocationError | null>(null);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Custom hooks
  const { isSupported: isGeolocationSupported } = useGeolocationSupport();
  const { getTestLocation } = useTestLocation({ useHardcodedLocation: useTestLocationInDev });
  const { centerMapOnLocation } = useMapCenter({ map });
  const { setTimeout, clearTimeout } = useTimeout();
  
  // Browser geolocation hook
  const browserGeolocation = useBrowserGeolocation({
    onSuccess: (position) => {
      if (!isMounted.current) return;
      
      const browserPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log('Got browser location:', browserPos.lat, browserPos.lng);
      
      // Only update if we don't have a location yet or if it's significantly different
      if (!userLocation || areLocationsSignificantlyDifferent(browserPos, userLocation)) {
        console.log('Browser location is different, updating');
        setUserLocation(browserPos);
        centerMapOnLocation(browserPos);
      }
    },
    onError: (error) => {
      console.error('Geolocation error:', error.code, error.message);
      // If we already have a test location, we can ignore this error
      if (!userLocation) {
        setError({
          code: error.code,
          message: error.message
        });
        setLocationState(LocationState.ERROR);
      }
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
      console.error('Geolocation is not supported by this browser');
      setError({ message: 'Geolocation is not supported by this browser' });
      setLocationState(LocationState.ERROR);
      
      // Try to use saved default location first
      const savedLocation = LocationPreferences.getDefaultLocation();
      if (savedLocation) {
        console.log('Using saved default location:', savedLocation);
        setUserLocation(savedLocation);
        centerMapOnLocation(savedLocation);
      } else {
        // Fall back to hardcoded default location
        console.log('No saved location, falling back to default location');
        setUserLocation(defaultCenter);
        centerMapOnLocation(defaultCenter);
      }
      return;
    }
    
    // For testing/development, use the hardcoded location
    if (useTestLocationInDev) {
      const testLoc = getTestLocation();
      setUserLocation(testLoc);
      centerMapOnLocation(testLoc);
      setLocationState(LocationState.SUCCESS);
      
      // Also try the geolocation API as a backup/verification
      browserGeolocation.requestLocation();
    } else {
      // In production or when test location is disabled, use browser geolocation
      browserGeolocation.requestLocation();
    }
  }, [
    locationState, 
    clearTimeout, 
    isGeolocationSupported, 
    useTestLocationInDev, 
    getTestLocation, 
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
    setUserLocation(null); // Clear current location to force a new request
    
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
  }, [centerMapOnLocation]);

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
