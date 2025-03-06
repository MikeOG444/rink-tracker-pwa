import { useCallback } from 'react';
import { Rink, getRinkDetails } from '../../services/places';

interface UseRinkSelectionProps {
  map: google.maps.Map | null;
  setSelectedRink: (rink: Rink | null) => void;
  setDetailedRink: (rink: Rink | null) => void;
  setShowRinkDetails: (show: boolean) => void;
}

/**
 * Hook to handle rink selection and details
 */
export const useRinkSelection = ({
  map,
  setSelectedRink,
  setDetailedRink,
  setShowRinkDetails
}: UseRinkSelectionProps) => {
  /**
   * Handle rink selection
   */
  const handleRinkSelect = useCallback(async (rink: Rink) => {
    console.log('Selected rink:', rink.name);
    setSelectedRink(rink);
    
    if (map) {
      console.log('Centering map on selected rink:', rink.position.lat, rink.position.lng);
      map.panTo(rink.position);
      map.setZoom(15);
      
      // Get detailed information about the rink
      try {
        const detailedRink = await getRinkDetails(rink.id, map);
        setDetailedRink(detailedRink);
        setShowRinkDetails(true);
      } catch (error) {
        console.error('Error getting rink details:', error);
        // Still show the details panel with the basic info we have
        setDetailedRink(rink);
        setShowRinkDetails(true);
      }
    }
  }, [map, setSelectedRink, setDetailedRink, setShowRinkDetails]);
  
  /**
   * Handle marker click
   */
  const handleMarkerClick = useCallback((rink: Rink) => {
    handleRinkSelect(rink);
  }, [handleRinkSelect]);
  
  /**
   * Close the rink details panel
   */
  const handleCloseRinkDetails = useCallback(() => {
    setShowRinkDetails(false);
    setDetailedRink(null);
  }, [setShowRinkDetails, setDetailedRink]);
  
  return {
    handleRinkSelect,
    handleMarkerClick,
    handleCloseRinkDetails
  };
};
