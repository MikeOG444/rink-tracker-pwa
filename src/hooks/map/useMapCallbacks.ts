import { useState, useCallback, useEffect, useRef } from 'react';
import { useMapCenter } from '../location/useMapCenter';
import { defaultZoom } from '../../components/map/constants/mapConfig';

interface UseMapCallbacksProps {
  userLocation: google.maps.LatLngLiteral | null;
  getUserLocation: () => void;
}

/**
 * Hook to manage map-related callbacks
 */
export const useMapCallbacks = ({
  userLocation,
  getUserLocation
}: UseMapCallbacksProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Use a ref to track if we've already centered the map
  const hasCenteredMap = useRef<boolean>(false);
  
  // Create a local map center function that uses the current map
  const { centerMapOnLocation: centerMapOnLocationLocal } = useMapCenter({ 
    map, 
    defaultZoom 
  });
  
  // Update the map in useUserLocation when it changes
  useEffect(() => {
    if (map && userLocation && !hasCenteredMap.current) {
      centerMapOnLocationLocal(userLocation);
      hasCenteredMap.current = true;
    }
  }, [map, userLocation, centerMapOnLocationLocal]);
  
  /**
   * Callback when map is loaded
   */
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded');
    setMap(map);
    
    // If we already have the user location, center the map on it
    if (userLocation) {
      console.log('User location already available, centering map');
      centerMapOnLocationLocal(userLocation);
      hasCenteredMap.current = true;
    } else {
      console.log('User location not available yet, requesting location');
      // Request user location
      getUserLocation();
    }
  }, [userLocation, getUserLocation, centerMapOnLocationLocal]);
  
  /**
   * Callback when map is unmounted
   */
  const onUnmount = useCallback(() => {
    console.log('Component unmounting');
    setMap(null);
    hasCenteredMap.current = false;
  }, []);

  return {
    map,
    onLoad,
    onUnmount
  };
};
