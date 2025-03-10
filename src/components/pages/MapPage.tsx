import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import RinkDetailsPanel from '../../components/map/RinkDetailsPanel';

// Import custom hooks
import { useUserLocation } from '../../hooks/useUserLocation';
import { useRinkSearch } from '../../hooks/useRinkSearch';
import { useVisitedRinks, useMapCallbacks } from '../../hooks/map';

// Import components
import SearchBar from '../map/components/SearchBar';
import MapControls from '../map/components/MapControls';
import ErrorDisplay from '../map/components/ErrorDisplay';
import LoadingScreen from '../map/components/LoadingScreen';
import MapContainer from '../map/components/MapContainer';

const MapPage = () => {
  console.log('MapPage rendering');
  const { user } = useAuth();
  
  // Use the Google Maps context
  const { isLoaded } = useGoogleMaps();

  // Use custom hooks
  const { visitedRinks } = useVisitedRinks(user?.uid || null);

  const { 
    userLocation, 
    isLocating, 
    error: locationError, 
    getUserLocation, 
    handleMyLocationClick,
    defaultCenter
  } = useUserLocation({ map: null });

  const { map, onLoad, onUnmount } = useMapCallbacks({
    userLocation,
    getUserLocation
  });

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
      
      {/* Map Container Component */}
      <MapContainer
        center={userLocation || defaultCenter}
        userLocation={userLocation}
        searchResults={searchResults}
        selectedRink={selectedRink}
        visitedRinks={visitedRinks}
        onLoad={onLoad}
        onUnmount={onUnmount}
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
