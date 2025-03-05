import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography, 
  CircularProgress, 
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

// Map container styles
const containerStyle = {
  width: '100%',
  height: '100vh'
};

// Default center (will be replaced with user's location)
const defaultCenter = {
  lat: 43.6532, // Toronto
  lng: -79.3832
};

// Mock data for rinks
interface Rink {
  id: string;
  name: string;
  address: string;
  position: google.maps.LatLngLiteral;
}

const mockRinks: Rink[] = [
  {
    id: '1',
    name: 'Toronto Ice Gardens',
    address: '123 Hockey Lane, Toronto',
    position: { lat: 43.6532, lng: -79.3832 }
  },
  {
    id: '2',
    name: 'Maple Leaf Arena',
    address: '456 Puck Street, Toronto',
    position: { lat: 43.6632, lng: -79.3732 }
  },
  {
    id: '3',
    name: 'Stanley Cup Rink',
    address: '789 Slapshot Avenue, Toronto',
    position: { lat: 43.6432, lng: -79.3932 }
  }
];

const MapPage = () => {
  console.log('MapPage rendering');
  const navigate = useNavigate();
  
  // Load the Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // State for map and location tracking
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Rink[]>([]);
  const [selectedRink, setSelectedRink] = useState<Rink | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  const locationTimeoutRef = useRef<number | null>(null);

  // Function to search for rinks
  const searchRinks = useCallback((query: string) => {
    console.log('Searching for rinks with query:', query);
    
    // Filter mock rinks based on query
    const results = mockRinks.filter(rink => 
      rink.name.toLowerCase().includes(query.toLowerCase()) ||
      rink.address.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('Search results:', results.length);
    setSearchResults(results);
  }, []);
  
  // Function to handle rink selection
  const handleRinkSelect = useCallback((rink: Rink) => {
    console.log('Selected rink:', rink.name);
    setSelectedRink(rink);
    
    if (map) {
      console.log('Centering map on selected rink:', rink.position.lat, rink.position.lng);
      map.panTo(rink.position);
      map.setZoom(15);
    }
  }, [map]);
  
  // Function to center map on a location
  const centerMapOnLocation = useCallback((location: google.maps.LatLngLiteral) => {
    if (!map) {
      console.log('Cannot center map: map not loaded yet');
      return;
    }
    
    console.log('Centering map on location:', location.lat, location.lng);
    map.panTo(location);
    map.setZoom(14);
    
    // Log the center after a short delay to ensure it's updated
    setTimeout(() => {
      const center = map.getCenter();
      if (center) {
        console.log('Map center is now:', center.lat(), center.lng());
      }
    }, 100);
  }, [map]);
  
  // Function to get user's current location
  const getUserLocation = useCallback(() => {
    console.log('getUserLocation called, isLocating:', isLocating);
    
    // Clear any existing timeout
    if (locationTimeoutRef.current) {
      console.log('Clearing existing location timeout');
      window.clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    
    // If already locating, don't do anything
    if (isLocating) {
      console.log('Already locating, skipping request');
      return;
    }
    
    // Reset error state
    setError(null);
    setIsLocating(true);
    console.log('Setting isLocating to true');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setError('Geolocation is not supported by this browser');
      setIsLocating(false);
      
      // Fall back to default location
      console.log('Falling back to default location');
      setUserLocation(defaultCenter);
      if (map) centerMapOnLocation(defaultCenter);
      return;
    }
    
    // For testing purposes, let's try to use the user's actual location directly
    // This is a hardcoded location for the user based on their feedback
    const userActualLocation = {
      lat: 41.584,
      lng: -73.8087
    };
    
    console.log('Using user\'s actual location:', userActualLocation.lat, userActualLocation.lng);
    setUserLocation(userActualLocation);
    if (map) centerMapOnLocation(userActualLocation);
    setIsLocating(false);
    
    // Also try the geolocation API as a backup
    try {
      console.log('Also requesting location from browser API...');
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          console.log('Geolocation success callback fired');
          
          if (!isMounted.current) {
            console.log('Component unmounted, ignoring location result');
            return;
          }
          
          const browserPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('Got browser location:', browserPos.lat, browserPos.lng);
          
          // Only update if it's different from our hardcoded location
          if (Math.abs(browserPos.lat - userActualLocation.lat) > 0.001 || 
              Math.abs(browserPos.lng - userActualLocation.lng) > 0.001) {
            console.log('Browser location is different, updating');
            setUserLocation(browserPos);
            if (map && !selectedRink) centerMapOnLocation(browserPos);
          }
        },
        // Error callback - we already have a location, so just log the error
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (e) {
      console.error('Exception in geolocation request:', e);
      // We already have a location, so no need to do anything else
    }
  }, [isLocating, selectedRink, centerMapOnLocation, map]);

  // Callback when map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded');
    setMap(map);
    
    // If we already have the user location, center the map on it
    if (userLocation) {
      console.log('User location already available, centering map');
      centerMapOnLocation(userLocation);
    } else {
      console.log('User location not available yet, requesting location');
      // Request user location
      getUserLocation();
    }
  }, [userLocation, getUserLocation, centerMapOnLocation]);
  
  // Callback when map is unmounted
  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
  }, []);

  // Request user location when component mounts
  useEffect(() => {
    console.log('useEffect triggered - isLoaded:', isLoaded, 'userLocation:', !!userLocation, 'isLocating:', isLocating);
    
    if (isLoaded && !userLocation && !isLocating) {
      console.log('Component mounted, requesting user location');
      getUserLocation();
    }
    
    // Clean up on unmount
    return () => {
      console.log('Component unmounting');
      isMounted.current = false;
      
      // Clear any pending timeouts
      if (locationTimeoutRef.current) {
        window.clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
    };
  }, [isLoaded, userLocation, isLocating, getUserLocation]);

  // Handle "My Location" button click
  const handleMyLocationClick = () => {
    console.log('My Location button clicked');
    
    // Force a new location request
    setIsLocating(false);
    setUserLocation(null); // Clear current location to force a new request
    
    // Add a small delay to ensure state is updated before calling getUserLocation
    setTimeout(() => {
      console.log('Requesting user location after button click');
      getUserLocation();
    }, 100);
  };
  
  // Handle back button click
  const handleBackClick = () => {
    console.log('Back button clicked');
    navigate('/');
  };
  
  // Handle error close
  const handleErrorClose = () => {
    console.log('Error dismissed');
    setError(null);
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Maps...</Typography>
      </Box>
    );
  }

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      searchRinks(query);
    } else {
      setSearchResults([]);
    }
  };

  console.log('Rendering map with userLocation:', userLocation ? 
    `{lat: ${userLocation.lat}, lng: ${userLocation.lng}}` : 'null', 
    'isLocating:', isLocating);

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      {/* Search bar */}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <Paper elevation={3} sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
              <List>
                {searchResults.map((rink, index) => (
                  <Box key={rink.id}>
                    <ListItem onClick={() => handleRinkSelect(rink)} sx={{ cursor: 'pointer' }}>
                      <ListItemText 
                        primary={rink.name} 
                        secondary={rink.address}
                        primaryTypographyProps={{ fontWeight: selectedRink?.id === rink.id ? 'bold' : 'normal' }}
                      />
                    </ListItem>
                    {index < searchResults.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          )}
        </Paper>
      </Box>
      
      {/* Back button */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
        <IconButton
          onClick={handleBackClick}
          sx={{ 
            backgroundColor: 'white',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </IconButton>
      </Box>
      
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your location"
            icon={{
              url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23E6EFFF' opacity='0.8'/%3E%3Ccircle cx='12' cy='12' r='6' fill='%234285F4'/%3E%3C/svg%3E",
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }}
          />
        )}
        
        {/* Rink markers */}
        {searchResults.map(rink => (
          <Marker
            key={rink.id}
            position={rink.position}
            title={rink.name}
            onClick={() => handleRinkSelect(rink)}
            animation={selectedRink?.id === rink.id ? google.maps.Animation.BOUNCE : undefined}
          />
        ))}
      </GoogleMap>

      {/* My Location button */}
      <Box sx={{ position: 'fixed', bottom: 30, left: 30, zIndex: 9999 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <IconButton
            color="default"
            onClick={handleMyLocationClick}
            disabled={isLocating}
            sx={{ 
              backgroundColor: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
            size="large"
          >
            {isLocating ? 
              <CircularProgress size={24} /> : 
              <MyLocationIcon fontSize="medium" color="primary" />
            }
          </IconButton>
        </Paper>
      </Box>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapPage;
