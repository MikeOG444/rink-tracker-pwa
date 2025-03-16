import React, { useEffect, useState } from 'react';
import { Rink } from '../../../services/placesAPI';

// Import SVG marker files
// In Vite, these imports will be URLs to the SVG files
import unvisitedMarkerIcon from '../../../assets/markers/mapMarker-rink-unvisited.svg';
import visitedMarkerIcon from '../../../assets/markers/mapMarker-rink-visited.svg';
import verifiedVisitMarkerIcon from '../../../assets/markers/mapMarker-rink-verifiedVisit.svg';

interface ClusteredRinkMarkersProps {
  map: google.maps.Map | null;
  userLocation: google.maps.LatLngLiteral | null;
  searchResults: Rink[];
  selectedRink: Rink | null;
  visitedRinks: Set<string>;
  verifiedRinks: Set<string>;
  handleMarkerClick: (rink: Rink) => void;
}

const ClusteredRinkMarkers: React.FC<ClusteredRinkMarkersProps> = ({
  map,
  userLocation,
  searchResults,
  selectedRink,
  visitedRinks,
  verifiedRinks,
  handleMarkerClick
}) => {
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [animatingMarkers, setAnimatingMarkers] = useState<Set<string>>(new Set());
  const [prevVisitedRinks, setPrevVisitedRinks] = useState<Set<string>>(new Set());
  const [prevVerifiedRinks, setPrevVerifiedRinks] = useState<Set<string>>(new Set());

  // Function to determine marker URL based on rink status
  const getMarkerUrl = (rink: Rink) => {
    // Use the imported SVG files based on visit status
    // Assume all search results are rinks and use custom markers for all of them
    if (verifiedRinks.has(rink.id)) {
      console.log('Using verified visit marker for rink:', rink.name);
      return verifiedVisitMarkerIcon;
    } else if (visitedRinks.has(rink.id)) {
      console.log('Using visited marker for rink:', rink.name);
      return visitedMarkerIcon;
    } else {
      console.log('Using unvisited marker for rink:', rink.name);
      return unvisitedMarkerIcon;
    }
  };

  // Detect changes in rink status for animations
  useEffect(() => {
    const newAnimatingMarkers = new Set<string>();
    
    // Check for newly visited rinks
    visitedRinks.forEach(rinkId => {
      if (!prevVisitedRinks.has(rinkId)) {
        newAnimatingMarkers.add(rinkId);
      }
    });
    
    // Check for newly verified rinks
    verifiedRinks.forEach(rinkId => {
      if (!prevVerifiedRinks.has(rinkId)) {
        newAnimatingMarkers.add(rinkId);
      }
    });
    
    // Update animating markers
    setAnimatingMarkers(newAnimatingMarkers);
    
    // Save current state for next comparison
    setPrevVisitedRinks(new Set(visitedRinks));
    setPrevVerifiedRinks(new Set(verifiedRinks));
    
    // Clear animations after a delay
    const timer = setTimeout(() => {
      setAnimatingMarkers(new Set());
    }, 3000); // 3 seconds animation
    
    return () => clearTimeout(timer);
  }, [visitedRinks, verifiedRinks]);

  // Create and manage markers
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    
    // Add user location marker if available
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        title: "Your location",
        icon: {
          url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23E6EFFF' opacity='0.8'/%3E%3Ccircle cx='12' cy='12' r='6' fill='%234285F4'/%3E%3C/svg%3E",
          scaledSize: new google.maps.Size(48, 48), // Doubled from 24x24 to 48x48
          anchor: new google.maps.Point(24, 24) // Adjusted anchor point
        },
        map
      });
      newMarkers.push(userMarker);
    }
    
    // Create rink markers
    searchResults.forEach(rink => {
      // Determine if this marker should be animating
      const shouldAnimate = animatingMarkers.has(rink.id) || selectedRink?.id === rink.id;
      
      const marker = new google.maps.Marker({
        position: rink.position,
        title: rink.name,
        animation: shouldAnimate ? google.maps.Animation.BOUNCE : undefined,
        icon: {
          url: getMarkerUrl(rink),
          scaledSize: new google.maps.Size(64, 64), // Doubled from 32x32 to 64x64
          anchor: new google.maps.Point(32, 64) // Adjusted anchor point
        },
        map
      });
      
      // Add click handler
      marker.addListener('click', () => handleMarkerClick(rink));
      
      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
    
    return () => {
      // Cleanup
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, searchResults, selectedRink, visitedRinks, verifiedRinks, animatingMarkers, userLocation]);

  // No need to return anything as we're managing markers directly
  return null;
};

export default ClusteredRinkMarkers;
