import React from 'react';
import { 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Box 
} from '@mui/material';
import { Rink } from '../../../../services/places';

interface SearchResultsListProps {
  searchResults: Rink[];
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  verifiedRinks?: Set<string>;
  handleRinkSelect: (rink: Rink) => void;
}

/**
 * Component to display search results with styling for selected and visited rinks
 */
const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchResults,
  selectedRink,
  visitedRinks,
  verifiedRinks,
  handleRinkSelect
}) => {
  if (searchResults.length === 0) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
      <List>
        {searchResults.map((rink, index) => (
          <Box key={rink.id}>
            <ListItem 
              onClick={() => handleRinkSelect(rink)} 
              sx={{ 
                cursor: 'pointer',
                bgcolor: selectedRink?.id === rink.id ? 'action.selected' : 'inherit'
              }}
            >
              <ListItemText 
                primary={rink.name} 
                secondary={rink.address}
                primaryTypographyProps={{ 
                  fontWeight: selectedRink?.id === rink.id ? 'bold' : 'normal',
                  color: verifiedRinks?.has(rink.id) 
                    ? 'error.main' // Verified visit (orange/red)
                    : visitedRinks.has(rink.id) 
                      ? 'success.main' // Visited but not verified (green)
                      : 'inherit' // Not visited (default)
                }}
              />
            </ListItem>
            {index < searchResults.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default SearchResultsList;
