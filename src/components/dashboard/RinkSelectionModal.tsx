import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Box, 
  Typography,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Rink, searchRinksByName } from '../../services/places';
import { useDebounce } from '../../hooks/search/useDebounce';
import { DEFAULT_SEARCH_DEBOUNCE_DELAY, MIN_QUERY_LENGTH, SearchState } from '../../hooks/search/searchUtils';
import { useGoogleMaps } from '../../context/GoogleMapsContext';

interface RinkSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectRink: (rink: Rink) => void;
}

const RinkSelectionModal: React.FC<RinkSelectionModalProps> = ({
  open,
  onClose,
  onSelectRink
}) => {
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>(SearchState.IDLE);
  const [searchResults, setSearchResults] = useState<Rink[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get Google Maps loading state from context
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Create a ref for the map div
  const mapRef = useRef<HTMLDivElement>(null);
  // Store the Google Map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Debounce search query to prevent too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, DEFAULT_SEARCH_DEBOUNCE_DELAY);
  
  // Function to initialize the map
  const initializeMap = () => {
    if (!mapRef.current || map || !isLoaded) return;
    
    console.log('🗺️ Initializing Google Map for Places API');
    setError(null);
    
    try {
      // Create a hidden map for the Places API
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 40, lng: -100 }, // Center of the US
        zoom: 4,
        disableDefaultUI: true
      });
      
      setMap(newMap);
      console.log('✅ Google Map initialized successfully');
    } catch (err) {
      console.error('❌ Error initializing Google Map:', err);
      setError('Error initializing map. Please try again.');
    }
  };
  
  // Initialize the map when the component mounts and Google Maps is loaded
  useEffect(() => {
    if (isLoaded) {
      initializeMap();
    } else if (loadError) {
      console.error('❌ Error loading Google Maps API:', loadError);
      setError('Error loading Google Maps API. Please try again later.');
    }
  }, [isLoaded, loadError, open]);
  
  // Search for rinks when the debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!map || !debouncedSearchQuery || debouncedSearchQuery.length < MIN_QUERY_LENGTH) {
        if (!map) console.log('⚠️ Map not initialized yet');
        if (!debouncedSearchQuery) console.log('⚠️ Empty search query');
        if (debouncedSearchQuery && debouncedSearchQuery.length < MIN_QUERY_LENGTH) 
          console.log(`⚠️ Query too short (${debouncedSearchQuery.length}/${MIN_QUERY_LENGTH})`);
        
        setSearchResults([]);
        setNoResults(false);
        setError(null);
        return;
      }
      
      console.log(`🔍 Performing search for: "${debouncedSearchQuery}" (debounced)`);
      setSearchState(SearchState.SEARCHING);
      setNoResults(false);
      setError(null);
      
      try {
        const results = await searchRinksByName(debouncedSearchQuery, map);
        console.log(`✅ Search complete, found ${results.length} results`);
        
        setSearchResults(results);
        setSearchState(SearchState.SUCCESS);
        
        if (results.length === 0) {
          setNoResults(true);
        }
      } catch (err) {
        console.error('❌ Error searching for rinks:', err);
        setError('Error searching for rinks. Please try again.');
        setSearchState(SearchState.ERROR);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery, map]);
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setNoResults(false);
    setError(null);
    setSearchState(SearchState.IDLE);
  };
  
  // Handle search button click
  const handleSearchClick = async () => {
    if (!map || !searchQuery || searchQuery.length < MIN_QUERY_LENGTH) {
      if (!map) setError('Map not initialized yet. Please try again.');
      if (!searchQuery) setError('Please enter a search term.');
      if (searchQuery && searchQuery.length < MIN_QUERY_LENGTH) 
        setError(`Search term must be at least ${MIN_QUERY_LENGTH} characters.`);
      return;
    }
    
    console.log(`🔍 Performing immediate search for: "${searchQuery}"`);
    setSearchState(SearchState.SEARCHING);
    setNoResults(false);
    setError(null);
    
    try {
      const results = await searchRinksByName(searchQuery, map);
      console.log(`✅ Immediate search complete, found ${results.length} results`);
      
      setSearchResults(results);
      setSearchState(SearchState.SUCCESS);
      
      if (results.length === 0) {
        setNoResults(true);
      }
    } catch (err) {
      console.error('❌ Error searching for rinks:', err);
      setError('Error searching for rinks. Please try again.');
      setSearchState(SearchState.ERROR);
    }
  };
  
  // Handle rink selection
  const handleRinkSelect = (rink: Rink) => {
    console.log('✅ Rink selected:', rink);
    onSelectRink(rink);
    onClose();
  };
  
  // Handle key press in search input
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth 
      maxWidth="sm"
      aria-modal="true"
      keepMounted
    >
      <DialogTitle>Select a Rink</DialogTitle>
      <DialogContent>
        {/* Hidden map div for Places API */}
        <div 
          ref={mapRef} 
          style={{ 
            height: '1px', 
            width: '1px', 
            position: 'absolute', 
            visibility: 'hidden' 
          }} 
        />
        
        {/* Search input and button */}
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search for hockey rinks"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              disabled={searchState === SearchState.SEARCHING}
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {searchState === SearchState.SEARCHING ? 
                      <CircularProgress size={20} /> : 
                      <SearchIcon />
                    }
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
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSearchClick}
              disabled={searchState === SearchState.SEARCHING || !searchQuery || searchQuery.length < MIN_QUERY_LENGTH}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        
        {/* Search instructions */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
          Enter a city or rink name and press Search or Enter
        </Typography>
        
        {/* Google Maps API loading status */}
        {!isLoaded && (
          <Box sx={{ mt: 1, mb: 1, p: 2, bgcolor: 'info.dark', borderRadius: 1 }}>
            <Typography variant="body2" color="white">
              Google Maps API is loading. You can enter your search query, but searching will only work once the API is loaded.
            </Typography>
          </Box>
        )}
        
        {/* Error message with retry button for Google Maps API */}
        {error && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
            {error.includes('Google Maps API not loaded') && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={initializeMap} 
                sx={{ mt: 1 }}
              >
                Retry Loading Maps API
              </Button>
            )}
          </Box>
        )}
        
        {/* No results message */}
        {noResults && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1">
              No rinks found for "{searchQuery}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different search term or location
            </Typography>
          </Box>
        )}
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <List sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
            {searchResults.map((rink, index) => (
              <Box key={rink.id}>
                <ListItem 
                  onClick={() => handleRinkSelect(rink)} 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText 
                    primary={rink.name} 
                    secondary={rink.address}
                  />
                </ListItem>
                {index < searchResults.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RinkSelectionModal;
