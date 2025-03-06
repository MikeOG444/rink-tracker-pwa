import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getUserVisitedRinks } from '../../services/firestore';
import RinkDetailsPanel from '../../components/map/RinkDetailsPanel';

// Import custom hooks
import { useUserLocation } from '../../hooks/useUserLocation';
import { useRinkSearch } from '../../hooks/useRinkSearch';

// Import components
import SearchBar from '../map/components/SearchBar';
import MapControls from '../map/components/MapControls';
import RinkMarkers from '../map/components/RinkMarkers';
import ErrorDisplay from '../map/components/ErrorDisplay';
import LoadingScreen from '../map/components/LoadingScreen';

// Map container styles
const containerStyle = {
  width: '100%',
  height: '100vh'
};

// Libraries to load with the Google Maps API
const libraries: any = ['places'];

const MapPage = () => {
  console.log('MapPage rendering');
  const { user } = useAuth();
  
  // Load the Google Maps JavaScript API with Places library
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // State for map
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // State for visited rinks
  const [visitedRinks, setVisitedRinks] = useState<Set<string>>(new Set());

  // Use custom hooks
  const { 
    userLocation, 
    isLocating, 
    error: locationError, 
    getUserLocation, 
    centerMapOnLocation, 
    handleMyLocationClick,
    defaultCenter
  } = useUserLocation({ map });

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

  // Combine errors from both hooks
  const error = locationError || searchError;

  // Load visited rinks for the current user
  useEffect(() => {
    const loadVisitedRinks = async () => {
      if (!user) return;
      
      try {
        const rinks = await getUserVisitedRinks(user.uid);
        const rinkIds = new Set(rinks.map(rink => rink.id));
        setVisitedRinks(rinkIds);
      } catch (error) {
        console.error('Error loading visited rinks:', error);
      }
    };
    
    loadVisitedRinks();
  }, [user]);

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
    if (isLoaded && !userLocation && !isLocating) {
      console.log('Component mounted, requesting user location');
      getUserLocation();
    }
  }, [isLoaded, userLocation, isLocating, getUserLocation]);

  // Show loading screen if Maps API is not loaded yet
  if (!isLoaded) {
    return <LoadingScreen />;
  }

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
        {/* Rink Markers Component */}
        <RinkMarkers
          userLocation={userLocation}
          searchResults={searchResults}
          selectedRink={selectedRink}
          visitedRinks={visitedRinks}
          handleMarkerClick={handleMarkerClick}
        />
      </GoogleMap>
      
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
        handleMyLocationClick={handleMyLocationClick}
        findRinksInView={findRinksInView}
      />
      
      {/* Error Display Component */}
      <ErrorDisplay
        error={error}
        handleErrorClose={handleErrorClose}
      />
    </Box>
  );
};

export default MapPage;
