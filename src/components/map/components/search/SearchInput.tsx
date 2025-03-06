import React from 'react';
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
  return (
    <TextField
      fullWidth
      placeholder="Search for hockey rinks"
      value={searchQuery}
      onChange={handleSearchChange}
      disabled={isSearching}
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
