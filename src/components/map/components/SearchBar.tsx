import React from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Rink } from '../../../services/placesAPI';

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
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {/* Search results - only show when searching by name */}
        {showSearchResults && searchResults.length > 0 && (
          <Paper elevation={3} sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
            <List>
              {searchResults.map((rink, index) => (
                <Box key={rink.id}>
                  <ListItem onClick={() => handleRinkSelect(rink)} sx={{ cursor: 'pointer' }}>
                    <ListItemText 
                      primary={rink.name} 
                      secondary={rink.address}
                      primaryTypographyProps={{ 
                        fontWeight: selectedRink?.id === rink.id ? 'bold' : 'normal',
                        color: visitedRinks.has(rink.id) ? 'success.main' : 'inherit'
                      }}
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        )}
        
        {/* No results message - only show when searching by name */}
        {showSearchResults && noResults && (
          <Paper elevation={3} sx={{ mt: 1, p: 2 }}>
            <Typography variant="body1" align="center">
              No rinks found. Try a different search term or location.
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default SearchBar;
