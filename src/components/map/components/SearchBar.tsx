import React from 'react';
import { Box, Paper } from '@mui/material';
import { Rink } from '../../../services/places';
import { SearchInput, SearchResultsList, NoResultsMessage } from './search';

/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  searchQuery: string;
  isSearching: boolean;
  showSearchResults: boolean;
  searchResults: Rink[];
  noResults: boolean;
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleRinkSelect: (rink: Rink) => void;
}

/**
 * SearchBar component that combines search input, results list, and no results message
 */
const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  isSearching,
  showSearchResults,
  searchResults,
  noResults,
  selectedRink,
  visitedRinks,
  handleSearchChange,
  handleClearSearch,
  handleRinkSelect
}) => {
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 20, 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '80%', 
      maxWidth: 500,
      zIndex: 1000 
    }}>
      <Paper elevation={3} sx={{ p: 1 }}>
        {/* Search Input Component */}
        <SearchInput
          searchQuery={searchQuery}
          isSearching={isSearching}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
        />
        
        {/* Search Results List Component */}
        {showSearchResults && searchResults.length > 0 && (
          <SearchResultsList
            searchResults={searchResults}
            selectedRink={selectedRink}
            visitedRinks={visitedRinks}
            handleRinkSelect={handleRinkSelect}
          />
        )}
        
        {/* No Results Message Component */}
        {showSearchResults && noResults && <NoResultsMessage />}
      </Paper>
    </Box>
  );
};

export default SearchBar;
