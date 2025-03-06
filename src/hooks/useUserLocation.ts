import { useState, useCallback, useRef, useEffect } from 'react';

// Default center (will be replaced with user's location)
const defaultCenter = {
  lat: 43.6532, // Toronto
  lng: -79.3832
};

// For testing purposes - hardcoded location
const userActualLocation = {
  lat: 41.584,
  lng: -73.8087
};

interface UseUserLocationProps {
  map: google.maps.Map | null;
}

export const useUserLocation = ({ map }: UseUserLocationProps) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  const locationTimeoutRef = useRef<number | null>(null);

  // Function to center map on a location
  const centerMapOnLocation = useCallback((location: google.maps.LatLngLiteral) => {
    if (!map) {
      console.log('Cannot center map: map not loaded yet');
      return;
    }
    
    console.log('Centering map on location:', location.lat, location.lng);
    map.panTo(location);
    map.setZoom(14);
    
    // Log the center after a short delay to ensure it's updated
    setTimeout(() => {
      const center = map.getCenter();
      if (center) {
        console.log('Map center is now:', center.lat(), center.lng());
      }
    }, 100);
  }, [map]);

  // Function to get user's current location
  const getUserLocation = useCallback(() => {
    console.log('getUserLocation called, isLocating:', isLocating);
    
    // Clear any existing timeout
    if (locationTimeoutRef.current) {
      console.log('Clearing existing location timeout');
      window.clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    
    // If already locating, don't do anything
    if (isLocating) {
      console.log('Already locating, skipping request');
      return;
    }
    
    // Reset error state
    setError(null);
    setIsLocating(true);
    console.log('Setting isLocating to true');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setError('Geolocation is not supported by this browser');
      setIsLocating(false);
      
      // Fall back to default location
      console.log('Falling back to default location');
      setUserLocation(defaultCenter);
      if (map) centerMapOnLocation(defaultCenter);
      return;
    }
    
    // For testing purposes, use the hardcoded location
    console.log('Using user\'s actual location:', userActualLocation.lat, userActualLocation.lng);
    setUserLocation(userActualLocation);
    if (map) centerMapOnLocation(userActualLocation);
    setIsLocating(false);
    
    // Also try the geolocation API as a backup
    try {
      console.log('Also requesting location from browser API...');
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          console.log('Geolocation success callback fired');
          
          if (!isMounted.current) {
            console.log('Component unmounted, ignoring location result');
            return;
          }
          
          const browserPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('Got browser location:', browserPos.lat, browserPos.lng);
          
          // Only update if it's different from our hardcoded location
          if (Math.abs(browserPos.lat - userActualLocation.lat) > 0.001 || 
              Math.abs(browserPos.lng - userActualLocation.lng) > 0.001) {
            console.log('Browser location is different, updating');
            setUserLocation(browserPos);
            if (map) centerMapOnLocation(browserPos);
          }
        },
        // Error callback - we already have a location, so just log the error
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (e) {
      console.error('Exception in geolocation request:', e);
      // We already have a location, so no need to do anything else
    }
  }, [isLocating, centerMapOnLocation, map]);

  // Handle "My Location" button click
  const handleMyLocationClick = useCallback(() => {
    console.log('My Location button clicked');
    
    // Force a new location request
    setIsLocating(false);
    setUserLocation(null); // Clear current location to force a new request
    
    // Add a small delay to ensure state is updated before calling getUserLocation
    setTimeout(() => {
      console.log('Requesting user location after button click');
      getUserLocation();
    }, 100);
  }, [getUserLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting');
      isMounted.current = false;
      
      // Clear any pending timeouts
      if (locationTimeoutRef.current) {
        window.clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    userLocation,
    isLocating,
    error,
    getUserLocation,
    centerMapOnLocation,
    handleMyLocationClick,
    defaultCenter
  };
};
