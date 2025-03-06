import { useState, useCallback, useRef } from 'react';
import { Rink, searchRinksByName, findRinksInMapBounds, getRinkDetails } from '../services/placesAPI';

interface UseRinkSearchProps {
  map: google.maps.Map | null;
}

export const useRinkSearch = ({ map }: UseRinkSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Rink[]>([]);
  const [selectedRink, setSelectedRink] = useState<Rink | null>(null);
  const [detailedRink, setDetailedRink] = useState<Rink | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRinkDetails, setShowRinkDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to search for rinks using Google Places API
  const searchRinks = useCallback(async (query: string) => {
    if (!map || !query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    console.log('Searching for rinks with query:', query);
    setIsSearching(true);
    setNoResults(false);
    setShowSearchResults(true);
    
    try {
      const results = await searchRinksByName(query, map);
      console.log('Search results:', results.length);
      
      if (results.length === 0) {
        setNoResults(true);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for rinks:', error);
      setError('Error searching for rinks. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [map]);
  
  // Function to find rinks in the current map view
  const findRinksInView = useCallback(async () => {
    if (!map) {
      setError('Cannot find rinks: Map is not available.');
      return;
    }
    
    console.log('Finding rinks in current map view');
    setIsSearching(true);
    setShowSearchResults(false); // Don't show dropdown for map view search
    setSearchQuery(''); // Clear search query
    
    try {
      const results = await findRinksInMapBounds(map);
      console.log('Map view results:', results.length);
      
      // Don't show results in dropdown, just add markers to the map
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No rinks found in the current map view.');
      }
    } catch (error) {
      console.error('Error finding rinks in map view:', error);
      setError('Error finding rinks. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [map]);
  
  // Function to handle rink selection
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
  }, [map]);
  
  // Function to handle marker click
  const handleMarkerClick = useCallback((rink: Rink) => {
    handleRinkSelect(rink);
  }, [handleRinkSelect]);
  
  // Handle search input change with debounce
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 2) {
      // Debounce search to avoid too many API calls
      searchTimeoutRef.current = setTimeout(() => {
        searchRinks(query);
      }, 500);
    } else {
      setSearchResults([]);
      setNoResults(false);
      setShowSearchResults(false);
    }
  }, [searchRinks]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    console.log('Clear search clicked');
    setSearchQuery('');
    setSearchResults([]);
    setNoResults(false);
    setSelectedRink(null);
    setShowRinkDetails(false);
    setShowSearchResults(false);
  }, []);
  
  // Close the rink details panel
  const handleCloseRinkDetails = useCallback(() => {
    setShowRinkDetails(false);
    setDetailedRink(null);
  }, []);
  
  // Handle error close
  const handleErrorClose = useCallback(() => {
    console.log('Error dismissed');
    setError(null);
  }, []);

  return {
    searchQuery,
    searchResults,
    selectedRink,
    detailedRink,
    isSearching,
    noResults,
    showSearchResults,
    showRinkDetails,
    error,
    searchRinks,
    findRinksInView,
    handleRinkSelect,
    handleMarkerClick,
    handleSearchChange,
    handleClearSearch,
    handleCloseRinkDetails,
    handleErrorClose
  };
};
