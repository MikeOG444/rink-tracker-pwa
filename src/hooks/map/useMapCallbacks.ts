import { useState, useCallback, useEffect } from 'react';
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
  
  // Create a local map center function that uses the current map
  const { centerMapOnLocation: centerMapOnLocationLocal } = useMapCenter({ 
    map, 
    defaultZoom 
  });
  
  // Update the map in useUserLocation when it changes
  useEffect(() => {
    if (map && userLocation) {
      centerMapOnLocationLocal(userLocation);
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
    console.log('Map unmounted');
    setMap(null);
  }, []);

  return {
    map,
    onLoad,
    onUnmount
  };
};
