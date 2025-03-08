import React, { useEffect, useRef } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchInputProps {
  searchQuery: string;
  isSearching: boolean;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
}

/**
 * Search input component with search icon, loading indicator, and clear button
 */
const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  isSearching,
  handleSearchChange,
  handleClearSearch
}) => {
  // Create a ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the component mounts
  useEffect(() => {
    // Small delay to ensure the input is rendered
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <TextField
      fullWidth
      placeholder="Search for hockey rinks"
      value={searchQuery}
      onChange={handleSearchChange}
      disabled={isSearching}
      inputRef={inputRef}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
          </InputAdornment>
        ),
        endAdornment: searchQuery && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClearSearch}
              edge="end"
              size="small"
              aria-label="clear search"
            >
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchInput;
