import { useCallback } from 'react';

interface UseMapCenterProps {
  map: google.maps.Map | null;
  defaultZoom?: number;
}

/**
 * Hook to handle centering the map on a location
 */
export const useMapCenter = ({ map, defaultZoom = 14 }: UseMapCenterProps) => {
  // Function to center map on a location
  const centerMapOnLocation = useCallback((location: google.maps.LatLngLiteral) => {
    if (!map) {
      console.log('Cannot center map: map not loaded yet');
      return false;
    }
    
    console.log('Centering map on location:', location.lat, location.lng);
    map.panTo(location);
    map.setZoom(defaultZoom);
    
    // Log the center after a short delay to ensure it's updated
    setTimeout(() => {
      const center = map.getCenter();
      if (center) {
        console.log('Map center is now:', center.lat(), center.lng());
      }
    }, 100);
    
    return true;
  }, [map, defaultZoom]);

  return { centerMapOnLocation };
};
