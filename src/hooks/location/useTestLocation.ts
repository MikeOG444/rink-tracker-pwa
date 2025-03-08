import { useCallback } from 'react';
import { userActualLocation, defaultCenter } from './locationUtils';

interface UseTestLocationProps {
  useHardcodedLocation?: boolean;
}

/**
 * Hook to provide test/hardcoded locations for development
 */
export const useTestLocation = ({ useHardcodedLocation = true }: UseTestLocationProps = {}) => {
  // Function to get the hardcoded test location
  const getTestLocation = useCallback((): google.maps.LatLngLiteral => {
    if (useHardcodedLocation) {
      console.log('Using hardcoded test location:', userActualLocation.lat, userActualLocation.lng);
      return userActualLocation;
    }
    
    // Fallback to default center if hardcoded location is disabled
    console.log('Using default center location:', defaultCenter.lat, defaultCenter.lng);
    return defaultCenter;
  }, [useHardcodedLocation]);

  return { getTestLocation, testLocation: useHardcodedLocation ? userActualLocation : defaultCenter };
};
