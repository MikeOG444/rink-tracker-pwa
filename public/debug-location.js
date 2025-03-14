/**
 * Debug utilities for location in Rink Tracker
 * 
 * To use these functions, paste this entire file into your browser console
 * and then call the functions as needed.
 */

/**
 * Get the current user location from the app state
 * @returns {Object|null} The user's location or null if not available
 */
function getUserLocation() {
  // Try to find the React component instance that has the userLocation state
  const rootElement = document.getElementById('root');
  if (!rootElement || !rootElement._reactRootContainer) {
    console.error('React root not found');
    return null;
  }

  // Alternative approach: check window object for any exposed location data
  if (window.__RINK_TRACKER_DEBUG__?.userLocation) {
    return window.__RINK_TRACKER_DEBUG__.userLocation;
  }

  // If we can't access React internals, use the browser's geolocation API directly
  console.log('Getting location directly from browser...');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const browserPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString()
      };
      console.log('Browser geolocation:', browserPos);
      return browserPos;
    },
    (error) => {
      console.error('Geolocation error:', error.code, error.message);
      return null;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );

  return "Check console for direct browser location";
}

/**
 * Get the location marker position from the map
 * @returns {Object|null} The marker position or null if not available
 */
function getMapMarkerLocation() {
  // Try to find the Google Maps instance
  let map = null;
  let userMarker = null;

  // Look for map instance in global scope
  if (window.google && window.google.maps) {
    // Find map instance
    const mapElements = document.querySelectorAll('[class*="map-container"]');
    if (mapElements.length > 0) {
      for (const element of mapElements) {
        if (element.__jsmap) {
          map = element.__jsmap;
          break;
        }
      }
    }

    // If map found, look for user marker
    if (map) {
      // Try to find the user location marker (blue dot)
      const markers = [];
      map.overlayMapTypes.forEach(overlay => {
        if (overlay && overlay.markers) {
          markers.push(...overlay.markers);
        }
      });

      // Also check for markers directly on the map
      if (map.markers) {
        markers.push(...map.markers);
      }

      // Find marker that might be the user location
      userMarker = markers.find(marker => 
        marker.icon && 
        (marker.icon.url?.includes('my-location') || 
         marker.icon.path === window.google.maps.SymbolPath.CIRCLE)
      );

      if (userMarker) {
        const position = userMarker.getPosition();
        return {
          lat: position.lat(),
          lng: position.lng()
        };
      }
    }
  }

  // Alternative approach: check for any exposed marker data
  if (window.__RINK_TRACKER_DEBUG__?.mapCenter) {
    return window.__RINK_TRACKER_DEBUG__.mapCenter;
  }

  // If we can't find the marker, return the map center as a fallback
  if (map) {
    const center = map.getCenter();
    return {
      lat: center.lat(),
      lng: center.lng(),
      note: "This is the map center, not necessarily the user marker"
    };
  }

  return null;
}

/**
 * Add debug hooks to expose location data globally
 */
function enableLocationDebugging() {
  // Create global debug object if it doesn't exist
  if (!window.__RINK_TRACKER_DEBUG__) {
    window.__RINK_TRACKER_DEBUG__ = {};
  }

  // Override the geolocation API to capture location data
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  navigator.geolocation.getCurrentPosition = function(success, error, options) {
    const wrappedSuccess = (position) => {
      const browserPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString()
      };
      
      window.__RINK_TRACKER_DEBUG__.userLocation = browserPos;
      console.log('Captured browser location:', browserPos);
      
      success(position);
    };
    
    originalGetCurrentPosition.call(navigator.geolocation, wrappedSuccess, error, options);
  };

  console.log('Location debugging enabled. Use getUserLocation() and getMapMarkerLocation() to check location data.');
}

// Automatically enable debugging
enableLocationDebugging();

// Print usage instructions
console.log(`
=== Rink Tracker Location Debugging ===
Available commands:
- getUserLocation() - Get the user's current location from the browser
- getMapMarkerLocation() - Get the location of the user marker on the map
- enableLocationDebugging() - Enable location debugging (already called)

Location debugging is now enabled. The next time the app requests your location,
it will be captured and available through these functions.
`);
