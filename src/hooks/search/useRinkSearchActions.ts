import { useCallback } from 'react';
import { Rink, searchRinksByName, findRinksInMapBounds } from '../../services/places';
import { SearchState, SearchError } from './searchUtils';

interface UseRinkSearchActionsProps {
  map: google.maps.Map | null;
  setSearchResults: (results: Rink[]) => void;
  setSearchState: (state: SearchState) => void;
  setError: (error: SearchError | null) => void;
  setNoResults: (noResults: boolean) => void;
  setShowSearchResults: (show: boolean) => void;
  resetSearch: () => void;
}

/**
 * Hook to handle rink search actions
 */
export const useRinkSearchActions = ({
  map,
  setSearchResults,
  setSearchState,
  setError,
  setNoResults,
  setShowSearchResults
}: UseRinkSearchActionsProps) => {
  /**
   * Search for rinks by name
   */
  const searchRinks = useCallback(async (query: string) => {
    if (!map || !query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return Promise.resolve();
    }
    
    console.log('🔍 Searching for rinks with query:', query);
    setSearchState(SearchState.SEARCHING);
    setNoResults(false);
    setShowSearchResults(true);
    
    try {
      // Add a small delay to prevent rapid consecutive searches
      // This helps with the "Maximum update depth exceeded" error
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const results = await searchRinksByName(query, map);
      console.log('✅ Found', results.length, 'results for query:', query);
      
      if (results.length === 0) {
        setNoResults(true);
      }
      
      setSearchResults(results);
      setSearchState(SearchState.SUCCESS);
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error searching for rinks:', error);
      setError({
        message: 'Error searching for rinks. Please try again.',
        originalError: error
      });
      setSearchState(SearchState.ERROR);
      return Promise.reject(error);
    }
  }, [map, setSearchResults, setSearchState, setError, setNoResults, setShowSearchResults]);
  
  /**
   * Find rinks in the current map view
   */
  const findRinksInView = useCallback(async () => {
    if (!map) {
      setError({
        message: 'Cannot find rinks: Map is not available.'
      });
      return;
    }
    
    console.log('🔍 Finding rinks in current map view');
    setSearchState(SearchState.SEARCHING);
    setShowSearchResults(false); // Don't show dropdown for map view search
    
    try {
      const results = await findRinksInMapBounds(map);
      console.log('✅ Found', results.length, 'rinks in current map view');
      
      // Don't show results in dropdown, just add markers to the map
      setSearchResults(results);
      
      if (results.length === 0) {
        setError({
          message: 'No rinks found in the current map view.'
        });
      }
      
      setSearchState(SearchState.SUCCESS);
    } catch (error) {
      console.error('❌ Error finding rinks in map view:', error);
      setError({
        message: 'Error finding rinks. Please try again.',
        originalError: error
      });
      setSearchState(SearchState.ERROR);
    }
  }, [map, setSearchResults, setSearchState, setError, setShowSearchResults]);
  
  /**
   * Handle error close
   */
  const handleErrorClose = useCallback(() => {
    console.log('Error dismissed');
    setError(null);
  }, [setError]);
  
  return {
    searchRinks,
    findRinksInView,
    handleErrorClose
  };
};
