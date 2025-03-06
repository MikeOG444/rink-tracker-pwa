import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { containerStyle, mapOptions, defaultZoom } from '../constants/mapConfig';
import RinkMarkers from './RinkMarkers';
import { Rink } from '../../../services/places';

interface MapContainerProps {
  center: google.maps.LatLngLiteral;
  userLocation: google.maps.LatLngLiteral | null;
  searchResults: Rink[];
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  onLoad: (map: google.maps.Map) => void;
  onUnmount: () => void;
  handleMarkerClick: (rink: Rink) => void;
}

/**
 * Component to render the Google Map and its markers
 */
const MapContainer: React.FC<MapContainerProps> = ({
  center,
  userLocation,
  searchResults,
  selectedRink,
  visitedRinks,
  onLoad,
  onUnmount,
  handleMarkerClick
}) => {
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={defaultZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
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
  );
};

export default MapContainer;
