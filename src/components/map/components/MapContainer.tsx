import React, { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { containerStyle, mapOptions, defaultZoom } from '../constants/mapConfig';
import ClusteredRinkMarkers from './ClusteredRinkMarkers';
import { Rink } from '../../../services/places';

interface MapContainerProps {
  center: google.maps.LatLngLiteral;
  userLocation: google.maps.LatLngLiteral | null;
  searchResults: Rink[];
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  verifiedRinks?: Set<string>;
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
  verifiedRinks,
  onLoad,
  onUnmount,
  handleMarkerClick
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  
  const handleMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
    onLoad(map);
  };
  
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={defaultZoom}
      onLoad={handleMapLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Clustered Rink Markers Component */}
      {mapInstance && (
        <ClusteredRinkMarkers
          map={mapInstance}
          userLocation={userLocation}
          searchResults={searchResults}
          selectedRink={selectedRink}
          visitedRinks={visitedRinks}
          verifiedRinks={verifiedRinks || new Set()}
          handleMarkerClick={handleMarkerClick}
        />
      )}
    </GoogleMap>
  );
};

export default MapContainer;
