import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  useRinkSearchState, 
  useRinkSearchActions, 
  useRinkSelection,
  useDebounce,
  DEFAULT_SEARCH_DEBOUNCE_DELAY,
  MIN_QUERY_LENGTH,
  SearchState
} from './search';

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
  
  // Local state to track if a search is in progress
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref to track the latest query to prevent stale closures
  const latestQueryRef = useRef('');
  
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
  
  // Use debounced search query with increased delay
  const debouncedQuery = useDebounce(searchState.searchQuery, DEFAULT_SEARCH_DEBOUNCE_DELAY);
  
  // Handle search input change - this updates the query state
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    searchState.setSearchQuery(query);
    latestQueryRef.current = query;
    
    if (query.length < MIN_QUERY_LENGTH) {
      searchState.setSearchResults([]);
      searchState.setNoResults(false);
      searchState.setShowSearchResults(false);
    }
  }, [searchState]);
  
  // Perform search when debounced query changes
  useEffect(() => {
    // Skip if query is too short or search is already in progress
    if (debouncedQuery.length < MIN_QUERY_LENGTH || isSearching) {
      return;
    }
    
    // Skip if the debounced query doesn't match the latest query
    // This prevents stale searches when typing quickly
    if (debouncedQuery !== latestQueryRef.current) {
      return;
    }
    
    // Use a local variable to track if this specific search is still relevant
    let isCurrent = true;
    
    const performSearch = async () => {
      try {
        setIsSearching(true);
        searchState.setSearchState(SearchState.SEARCHING);
        await searchActions.searchRinks(debouncedQuery);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        // Only update state if this search is still relevant
        if (isCurrent) {
          setIsSearching(false);
        }
      }
    };
    
    performSearch();
    
    // Cleanup function to handle component unmounting during search
    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, searchActions, searchState, isSearching]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    console.log('Clear search clicked');
    searchState.resetSearch();
    // Removed resetSelection() call to keep the location card open when clearing search
    setIsSearching(false);
    latestQueryRef.current = '';
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
