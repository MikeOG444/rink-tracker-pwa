import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Paper, IconButton, Typography, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

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

const MapPage = () => {
  console.log('MapPage component rendering');
  
  // Load the Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // State for map and location tracking
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);

  // Function to get user's current location
  const getUserLocation = useCallback(() => {
    console.log('getUserLocation called, isLocating:', isLocating);
    
    if (isLocating) {
      console.log('Already locating, returning');
      return; // Prevent multiple simultaneous requests
    }
    
    console.log('Getting user location...');
    setIsLocating(true);
    setLocationError(null);
    
    // Set a timeout to handle cases where geolocation takes too long
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        console.log('Location request timed out');
        setLocationError('Location request timed out. Please try again.');
        setIsLocating(false);
      }
    }, 10000); // 10 seconds timeout
    
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Got position:', position.coords.latitude, position.coords.longitude);
            
            if (isMounted.current) {
              clearTimeout(timeoutId);
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              console.log('Setting userLocation state to:', userPos);
              setUserLocation(userPos);
              
              // Center map on user location if map is available
              if (map) {
                console.log('Map is available, centering on user location');
                map.panTo(userPos);
                map.setZoom(14);
              } else {
                console.log('Map is NOT available, cannot center');
              }
              
              // Always stop the spinner, regardless of map availability
              console.log('Setting isLocating to false');
              setIsLocating(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error.code, error.message);
            if (isMounted.current) {
              clearTimeout(timeoutId);
              
              // Provide more user-friendly error messages
              let errorMessage = 'Error getting your location.';
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied. Please enable location services in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information is unavailable. Please try again later.';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage = `Error getting your location: ${error.message}`;
              }
              
              setLocationError(errorMessage);
              setIsLocating(false);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          }
        );
      } catch (e: unknown) {
        console.error('Exception in geolocation:', e);
        clearTimeout(timeoutId);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        setLocationError(`Unexpected error: ${errorMessage}`);
        setIsLocating(false);
      }
    } else {
      console.error('Geolocation not supported');
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLocationError('Geolocation is not supported by this browser.');
        setIsLocating(false);
      }
    }
    
    // Cleanup function to clear the timeout
    return () => {
      console.log('Cleaning up geolocation request');
      clearTimeout(timeoutId);
    };
  }, [map, isLocating]);

  // Effect to log when isLocating changes
  useEffect(() => {
    console.log('isLocating changed to:', isLocating);
  }, [isLocating]);

  // Effect to log when userLocation changes
  useEffect(() => {
    console.log('userLocation changed to:', userLocation);
    
    // Center map on user location if both are available
    if (userLocation && map) {
      console.log('Both userLocation and map available, centering map');
      map.panTo(userLocation);
      map.setZoom(14);
    }
  }, [userLocation, map]);

  // Callback when map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
    
    // If we already have the user location, center the map on it
    if (userLocation) {
      console.log('userLocation already available, centering map');
      map.panTo(userLocation);
      map.setZoom(14);
    } else {
      console.log('userLocation not available yet, getting location');
      // Add a small delay to ensure the map is fully initialized
      setTimeout(() => {
        if (isMounted.current) {
          getUserLocation();
        }
      }, 500);
    }
  }, [userLocation, getUserLocation]);

  // Callback when map is unmounted
  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting');
      isMounted.current = false;
    };
  }, []);

  // Handle "My Location" button click
  const handleMyLocationClick = () => {
    console.log('My Location button clicked');
    getUserLocation();
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Maps...
        </Typography>
      </Box>
    );
  }

  console.log('Rendering map with userLocation:', userLocation, 'isLocating:', isLocating);

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
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
        {/* User location marker - styled like Google Maps blue dot */}
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
      </GoogleMap>

      {/* Control buttons container */}
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
        {/* Google Maps style My Location button */}
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

      {/* Error message - more visible */}
      {locationError && (
        <Paper
          elevation={5}
          sx={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 2,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            zIndex: 1000,
            maxWidth: '80%',
            border: '1px solid #d32f2f',
            borderRadius: '8px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {locationError}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You may need to allow location access in your browser settings to use this feature.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MapPage;
