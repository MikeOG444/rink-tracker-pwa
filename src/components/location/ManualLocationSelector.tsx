import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { LocationPreferences } from '../../services/location/LocationPreferences';
import { logger } from '../../services/logging';

interface ManualLocationSelectorProps {
  open: boolean;
  onClose: () => void;
  onLocationSelected: (location: google.maps.LatLngLiteral) => void;
  map?: google.maps.Map | null;
}

/**
 * Component for manually selecting a location
 */
const ManualLocationSelector: React.FC<ManualLocationSelectorProps> = ({
  open,
  onClose,
  onLocationSelected,
  map
}) => {
  const { isLoaded } = useGoogleMaps();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  
  // Create a reference to a DOM element for the PlacesService
  const placesServiceElementRef = React.useRef<HTMLDivElement | null>(null);

  // Create a reference to the autocomplete service
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  
  // Initialize services when the map is loaded
  useEffect(() => {
    if (isLoaded) {
      // Initialize the autocomplete service
      setAutocompleteService(new google.maps.places.AutocompleteService());
      
      // Initialize the places service
      if (map) {
        setPlacesService(new google.maps.places.PlacesService(map));
      } else {
        // Ensure we have a DOM element to use
        if (!placesServiceElementRef.current) {
          placesServiceElementRef.current = document.createElement('div');
          placesServiceElementRef.current.id = 'places-service-element';
          placesServiceElementRef.current.style.display = 'none';
          document.body.appendChild(placesServiceElementRef.current);
        }
        
        setPlacesService(new google.maps.places.PlacesService(placesServiceElementRef.current));
      }
      
      // Create a new session token
      setSessionToken(new google.maps.places.AutocompleteSessionToken());
    }
  }, [isLoaded, map]);
  
  // Create a new session token when the dialog opens
  useEffect(() => {
    if (open && isLoaded) {
      setSessionToken(new google.maps.places.AutocompleteSessionToken());
    }
  }, [open, isLoaded]);
  
  // Debounce the search query to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);
  
  // Trigger search when debounced query changes
  useEffect(() => {
    const query = debouncedSearchQuery;
    
    // Only search if at least 2 characters
    if (!query.trim() || query.trim().length < 2 || !isLoaded || !autocompleteService) return;
    
    const performSearch = async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        // Use the Autocomplete service to get predictions
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          // No types specified to allow all types of places (cities, addresses, landmarks)
          sessionToken: sessionToken || undefined,
        };
        
        // If we have a map, use its bounds to bias the results
        if (map && map.getBounds()) {
          request.bounds = map.getBounds() || undefined;
        }
        
        autocompleteService.getPlacePredictions(
          request,
          (predictions, status) => {
            setIsSearching(false);
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              // Convert predictions to PlaceResult format for compatibility with existing code
              const convertedResults: google.maps.places.PlaceResult[] = predictions.map(prediction => ({
                place_id: prediction.place_id,
                name: prediction.structured_formatting?.main_text || prediction.description,
                formatted_address: prediction.structured_formatting?.secondary_text || '',
                // Other fields will be populated when the place is selected
              }));
              
              setSearchResults(convertedResults);
            } else {
              setError('No locations found. Please try a different search term.');
              setSearchResults([]);
              logger.error('Places Autocomplete error', 'ManualLocationSelector', { status, query });
            }
          }
        );
      } catch (err) {
        setIsSearching(false);
        setError('An error occurred while searching. Please try again.');
        logger.error('Error searching for location', 'ManualLocationSelector', err);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery, isLoaded, autocompleteService, map, sessionToken]);
  
  // Handle search button click
  const handleSearch = () => {
    // Update the debounced query to trigger the search
    setDebouncedSearchQuery(searchQuery);
  };
  
  // Clean up the DOM element when the component unmounts
  React.useEffect(() => {
    return () => {
      if (placesServiceElementRef.current && document.body.contains(placesServiceElementRef.current)) {
        try {
          document.body.removeChild(placesServiceElementRef.current);
        } catch (error) {
          // Log the error but don't throw it
          logger.error('Error removing places service element', 'ManualLocationSelector', error);
        }
      }
    };
  }, []);
  
  // Handle location selection
  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    // If we already have geometry information, use it directly
    if (place.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      // Save as default if checkbox is checked
      if (saveAsDefault) {
        LocationPreferences.saveDefaultLocation(location);
      }
      
      onLocationSelected(location);
      onClose();
    } 
    // Otherwise, fetch the place details to get the geometry
    else if (place.place_id && placesService) {
      setIsSearching(true);
      
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: place.place_id,
        fields: ['geometry', 'name', 'formatted_address'],
        sessionToken: sessionToken || undefined
      };
      
      placesService.getDetails(request, (result, status) => {
        setIsSearching(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && result && result.geometry?.location) {
          const location = {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng()
          };
          
          // Save as default if checkbox is checked
          if (saveAsDefault) {
            LocationPreferences.saveDefaultLocation(location);
          }
          
          onLocationSelected(location);
          onClose();
        } else {
          setError('Could not get location details. Please try another location.');
          logger.error('Places Details error', 'ManualLocationSelector', { status, placeId: place.place_id });
        }
      });
    } else {
      setError('Invalid location selected. Please try again.');
    }
  };
  
  // Handle key press in search field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="manual-location-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="manual-location-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Set Your Location</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Search for a city, address, or landmark to set your location:
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isLoaded || isSearching}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={!isLoaded || isSearching || !searchQuery.trim()}
            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {searchResults.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Search Results:
            </Typography>
            <List>
              {searchResults.map((place) => (
                <React.Fragment key={place.place_id}>
                  <ListItem 
                    onClick={() => handleLocationSelect(place)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <PlaceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={place.name} 
                      secondary={place.formatted_address} 
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="save-default"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
          />
          <label htmlFor="save-default" style={{ marginLeft: '8px' }}>
            Save selected location as my default
          </label>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualLocationSelector;
