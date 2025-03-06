import React from 'react';
import { Marker } from '@react-google-maps/api';
import { Rink } from '../../../services/placesAPI';

interface RinkMarkersProps {
  userLocation: google.maps.LatLngLiteral | null;
  searchResults: Rink[];
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  handleMarkerClick: (rink: Rink) => void;
}

const RinkMarkers: React.FC<RinkMarkersProps> = ({
  userLocation,
  searchResults,
  selectedRink,
  visitedRinks,
  handleMarkerClick
}) => {
  return (
    <>
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
          onClick={() => handleMarkerClick(rink)}
          animation={selectedRink?.id === rink.id ? google.maps.Animation.BOUNCE : undefined}
          icon={{
            url: visitedRinks.has(rink.id) 
              ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%234CAF50' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E"
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%231976D2' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }}
        />
      ))}
    </>
  );
};

export default RinkMarkers;
