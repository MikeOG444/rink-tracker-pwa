import { useState } from 'react';
import { Rink } from '../../services/places';
import { SearchState, SearchError } from './searchUtils';

/**
 * Hook to manage rink search state
 */
export const useRinkSearchState = () => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Search results state
  const [searchResults, setSearchResults] = useState<Rink[]>([]);
  
  // Search state (idle, searching, success, error)
  const [searchState, setSearchState] = useState<SearchState>(SearchState.IDLE);
  
  // Error state
  const [error, setError] = useState<SearchError | null>(null);
  
  // No results flag
  const [noResults, setNoResults] = useState<boolean>(false);
  
  // Show search results flag
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  // Selected rink state
  const [selectedRink, setSelectedRink] = useState<Rink | null>(null);
  
  // Detailed rink state (for the details panel)
  const [detailedRink, setDetailedRink] = useState<Rink | null>(null);
  
  // Show rink details panel flag
  const [showRinkDetails, setShowRinkDetails] = useState<boolean>(false);
  
  // Reset search state
  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setNoResults(false);
    setShowSearchResults(false);
    setError(null);
    setSearchState(SearchState.IDLE);
  };
  
  // Reset selection state
  const resetSelection = () => {
    setSelectedRink(null);
    setDetailedRink(null);
    setShowRinkDetails(false);
  };
  
  return {
    // State
    searchQuery,
    searchResults,
    searchState,
    error,
    noResults,
    showSearchResults,
    selectedRink,
    detailedRink,
    showRinkDetails,
    
    // Derived state
    isSearching: searchState === SearchState.SEARCHING,
    isError: searchState === SearchState.ERROR,
    
    // Setters
    setSearchQuery,
    setSearchResults,
    setSearchState,
    setError,
    setNoResults,
    setShowSearchResults,
    setSelectedRink,
    setDetailedRink,
    setShowRinkDetails,
    
    // Actions
    resetSearch,
    resetSelection
  };
};
