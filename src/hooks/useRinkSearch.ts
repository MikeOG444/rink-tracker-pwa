import { useCallback, useEffect } from 'react';
import { 
  useRinkSearchState, 
  useRinkSearchActions, 
  useRinkSelection,
  useDebounce,
  DEFAULT_SEARCH_DEBOUNCE_DELAY,
  MIN_QUERY_LENGTH
} from './search';
import { Rink } from '../services/places';

interface UseRinkSearchProps {
  map: google.maps.Map | null;
}

/**
 * Main hook for rink search functionality
 * Combines smaller, focused hooks for better maintainability
 */
export const useRinkSearch = ({ map }: UseRinkSearchProps) => {
  // Get search state from useRinkSearchState hook
  const searchState = useRinkSearchState();
  
  // Get rink selection handlers from useRinkSelection hook
  const selectionHandlers = useRinkSelection({
    map,
    setSelectedRink: searchState.setSelectedRink,
    setDetailedRink: searchState.setDetailedRink,
    setShowRinkDetails: searchState.setShowRinkDetails
  });
  
  // Get search actions from useRinkSearchActions hook
  const searchActions = useRinkSearchActions({
    map,
    setSearchResults: searchState.setSearchResults,
    setSearchState: searchState.setSearchState,
    setError: searchState.setError,
    setNoResults: searchState.setNoResults,
    setShowSearchResults: searchState.setShowSearchResults,
    resetSearch: searchState.resetSearch
  });
  
  // Use debounced search query
  const debouncedQuery = useDebounce(searchState.searchQuery, DEFAULT_SEARCH_DEBOUNCE_DELAY);
  
  // Handle search input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    searchState.setSearchQuery(query);
    
    if (query.length < MIN_QUERY_LENGTH) {
      searchState.setSearchResults([]);
      searchState.setNoResults(false);
      searchState.setShowSearchResults(false);
    }
  }, [searchState]);
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) {
      searchActions.searchRinks(debouncedQuery);
    }
  }, [debouncedQuery, searchActions]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    console.log('Clear search clicked');
    searchState.resetSearch();
    searchState.resetSelection();
  }, [searchState]);
  
  return {
    // State
    searchQuery: searchState.searchQuery,
    searchResults: searchState.searchResults,
    selectedRink: searchState.selectedRink,
    detailedRink: searchState.detailedRink,
    isSearching: searchState.isSearching,
    noResults: searchState.noResults,
    showSearchResults: searchState.showSearchResults,
    showRinkDetails: searchState.showRinkDetails,
    error: searchState.error?.message || null,
    
    // Actions
    findRinksInView: searchActions.findRinksInView,
    handleRinkSelect: selectionHandlers.handleRinkSelect,
    handleMarkerClick: selectionHandlers.handleMarkerClick,
    handleSearchChange,
    handleClearSearch,
    handleCloseRinkDetails: selectionHandlers.handleCloseRinkDetails,
    handleErrorClose: searchActions.handleErrorClose
  };
};
