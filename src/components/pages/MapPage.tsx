import { useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import RinkDetailsPanel from '../../components/map/RinkDetailsPanel';
import { geolocationService } from '../../services/location/GeolocationService';

// Import custom hooks
import { useRinkSearch } from '../../hooks/useRinkSearch';
import { useVisitedRinks } from '../../hooks/map';

// Import components
import SearchBar from '../map/components/SearchBar';
import MapControls from '../map/components/MapControls';
import ErrorDisplay from '../map/components/ErrorDisplay';
import LoadingScreen from '../map/components/LoadingScreen';
import MapContainer from '../map/components/MapContainer';
import ManualLocationSelector from '../location/ManualLocationSelector';

const MapPage = () => {
  console.log('MapPage rendering');
  const { user } = useAuth();
  const [showManualLocationSelector, setShowManualLocationSelector] = useState(false);
  
  // Use the Google Maps context
  const { isLoaded } = useGoogleMaps();

  // State for location
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Use custom hooks
  const { visitedRinks } = useVisitedRinks(user?.uid || null);

  // Initialize location from GeolocationService
  useEffect(() => {
    // Subscribe to location updates
    const unsubscribe = geolocationService.subscribe(result => {
      setIsLocating(geolocationService.isCurrentlyLocating());
      
      if (result.location) {
        setUserLocation(result.location);
        setLocationError(null);
      } else if (result.error) {
        setLocationError(result.error.message);
      }
    });
    
    // Get initial location (from cache if available)
    setIsLocating(true);
    geolocationService.getCurrentLocation().then(() => {
      setIsLocating(false);
    });
    
    return unsubscribe;
  }, []);

  // Center map when location changes
  useEffect(() => {
    if (map && userLocation) {
      console.log('Centering map on location:', userLocation);
      map.panTo(userLocation);
      map.setZoom(14); // Or whatever zoom level is appropriate
    }
  }, [map, userLocation]);

  // Handle "My Location" button click
  const handleMyLocationClick = useCallback(async () => {
    console.log('My Location button clicked');
    
    // Force a fresh geolocation request
    setIsLocating(true);
    try {
      const result = await geolocationService.getCurrentLocation(true);
      if (result.location) {
        setUserLocation(result.location);
        setLocationError(null);
        
        // Center map on the new location
        if (map) {
          map.panTo(result.location);
          map.setZoom(14);
        }
      } else if (result.error) {
        setLocationError(result.error.message);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLocating(false);
    }
  }, [map]);

  // Handle manual location setting
  const handleSetManualLocation = useCallback((location: google.maps.LatLngLiteral) => {
    geolocationService.setManualLocation(location);
    setShowManualLocationSelector(false);
  }, []);

  // Map callbacks
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded');
    setMap(map);
    
    // If we already have a location, center the map on it
    if (userLocation) {
      console.log('Centering map on initial location');
      map.panTo(userLocation);
      map.setZoom(14);
    } else {
      // Use default location until we get the actual location
      const defaultLocation = geolocationService.getDefaultLocation();
      map.panTo(defaultLocation);
    }
  }, [userLocation]);

  const handleMapUnmount = useCallback(() => {
    console.log('Map unmounting');
    setMap(null);
  }, []);

  // Use the rink search hook
  const {
    searchQuery,
    searchResults,
    selectedRink,
    detailedRink,
    isSearching,
    noResults,
    showSearchResults,
    showRinkDetails,
    error: searchError,
    handleRinkSelect,
    handleMarkerClick,
    handleSearchChange,
    handleClearSearch,
    handleCloseRinkDetails,
    handleErrorClose,
    findRinksInView
  } = useRinkSearch({ map });

  // Show loading screen if Maps API is not loaded yet
  if (!isLoaded) {
    return <LoadingScreen message="Loading Maps API..." />;
  }

  // Get the best available location (user location or default)
  const mapCenter = userLocation || geolocationService.getDefaultLocation();

  console.log('Rendering map with userLocation:', userLocation ? 
    `{lat: ${userLocation.lat}, lng: ${userLocation.lng}}` : 'null', 
    'isLocating:', isLocating);

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      {/* Search Bar Component */}
      <SearchBar
        searchQuery={searchQuery}
        isSearching={isSearching}
        showSearchResults={showSearchResults}
        searchResults={searchResults}
        noResults={noResults}
        selectedRink={selectedRink}
        visitedRinks={visitedRinks}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleRinkSelect={handleRinkSelect}
      />
      
      {/* Map Container Component */}
      <MapContainer
        center={mapCenter}
        userLocation={userLocation}
        searchResults={searchResults}
        selectedRink={selectedRink}
        visitedRinks={visitedRinks}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        handleMarkerClick={handleMarkerClick}
      />
      
      {/* Rink Details Panel */}
      {showRinkDetails && detailedRink && (
        <RinkDetailsPanel 
          rink={detailedRink} 
          onClose={handleCloseRinkDetails} 
        />
      )}

      {/* Map Controls Component */}
      <MapControls
        isLocating={isLocating}
        isSearching={isSearching}
        onLocationUpdate={handleMyLocationClick}
        findRinksInView={findRinksInView}
        setManualLocation={locationError ? undefined : () => setShowManualLocationSelector(true)}
      />
      
      {/* Error Display Component */}
      <ErrorDisplay
        error={searchError || locationError}
        handleErrorClose={() => {
          if (searchError) handleErrorClose();
          if (locationError) setLocationError(null);
        }}
      />
      
      {/* Manual Location Selector */}
      <ManualLocationSelector
        open={showManualLocationSelector}
        onClose={() => setShowManualLocationSelector(false)}
        onLocationSelected={handleSetManualLocation}
        map={map}
      />
    </Box>
  );
};

export default MapPage;
