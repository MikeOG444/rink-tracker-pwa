// Google Places API service for rink-related operations

// Define the Rink interface that will be used throughout the application
export interface Rink {
  id: string;          // Google Places ID
  name: string;        // Rink name
  address: string;     // Formatted address
  position: google.maps.LatLngLiteral;
  photo?: string;      // Google Places photo reference
  rating?: number;     // Google rating if available
  visitCount?: number; // Number of times user has visited
  lastVisit?: string;  // Timestamp of last visit
}

// Convert a Google Place result to our Rink interface
const convertPlaceToRink = (place: google.maps.places.PlaceResult): Rink => {
  return {
    id: place.place_id || `temp-${Date.now()}`,
    name: place.name || 'Unknown Rink',
    address: place.formatted_address || place.vicinity || 'No address available',
    position: {
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0
    },
    photo: place.photos?.[0]?.getUrl(),
    rating: place.rating
  };
};

// Search for rinks by name using Places API Text Search
export const searchRinksByName = (
  query: string,
  map: google.maps.Map
): Promise<Rink[]> => {
  return new Promise((resolve, reject) => {
    if (!query.trim()) {
      resolve([]);
      return;
    }

    console.log('🔍 Searching for rinks with query:', query);
    
    // Create a Places Service instance
    const service = new google.maps.places.PlacesService(map);
    
    // Perform a text search for ice rinks
    service.textSearch(
      {
        query: `${query} ice rink hockey`,
        type: 'establishment'
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('✅ Found', results.length, 'results for query:', query);
          
          // Convert Google Places results to our Rink interface
          const rinks = results.map(convertPlaceToRink);
          resolve(rinks);
        } else {
          console.error('❌ Places API error:', status);
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      }
    );
  });
};

// Find nearby rinks using Places API Nearby Search
export const findNearbyRinks = (
  location: google.maps.LatLngLiteral,
  radius: number = 80467, // Default to 50 miles in meters
  map: google.maps.Map
): Promise<Rink[]> => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Finding nearby rinks within', radius / 1609, 'miles');
    
    // Create a Places Service instance
    const service = new google.maps.places.PlacesService(map);
    
    // Perform a nearby search for ice rinks
    service.nearbySearch(
      {
        location: location,
        radius: radius,
        keyword: 'ice rink hockey',
        type: 'establishment'
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('✅ Found', results.length, 'nearby rinks');
          
          // Convert Google Places results to our Rink interface
          const rinks = results.map(convertPlaceToRink);
          resolve(rinks);
        } else {
          console.error('❌ Places API error:', status);
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      }
    );
  });
};

// Find rinks in the current map bounds
export const findRinksInMapBounds = (
  map: google.maps.Map
): Promise<Rink[]> => {
  return new Promise((resolve, reject) => {
    const bounds = map.getBounds();
    if (!bounds) {
      console.error('❌ Map bounds not available');
      resolve([]);
      return;
    }
    
    console.log('🔍 Finding rinks in current map view');
    
    // Create a Places Service instance
    const service = new google.maps.places.PlacesService(map);
    
    // Get the center of the current bounds
    const center = bounds.getCenter();
    if (!center) {
      console.error('❌ Could not get center of map bounds');
      resolve([]);
      return;
    }
    
    // Calculate the radius that covers the visible area
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    // Calculate the diagonal distance in meters (approximate)
    const latDiff = Math.abs(ne.lat() - sw.lat());
    const lngDiff = Math.abs(ne.lng() - sw.lng());
    
    // Convert to meters (very approximate)
    const latMeters = latDiff * 111000; // 1 degree lat is about 111km
    const lngMeters = lngDiff * 111000 * Math.cos(center.lat() * Math.PI / 180);
    
    // Use the diagonal distance as radius
    const radius = Math.sqrt(latMeters * latMeters + lngMeters * lngMeters) / 2;
    
    console.log('🔍 Search radius:', Math.round(radius), 'meters');
    
    // Perform a nearby search for ice rinks
    service.nearbySearch(
      {
        location: {
          lat: center.lat(),
          lng: center.lng()
        },
        radius: radius,
        keyword: 'ice rink hockey',
        type: 'establishment'
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('✅ Found', results.length, 'rinks in map view');
          
          // Convert Google Places results to our Rink interface
          const rinks = results.map(convertPlaceToRink);
          resolve(rinks);
        } else {
          console.error('❌ Places API error:', status);
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      }
    );
  });
};

// Get detailed information about a specific rink
export const getRinkDetails = (
  placeId: string,
  map: google.maps.Map
): Promise<Rink> => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Getting details for rink:', placeId);
    
    // Create a Places Service instance
    const service = new google.maps.places.PlacesService(map);
    
    // Request detailed information about the place
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'photos',
          'rating',
          'vicinity',
          'website',
          'formatted_phone_number',
          'opening_hours'
        ]
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          console.log('✅ Got details for rink:', place.name);
          
          // Convert Google Places result to our Rink interface with additional details
          const rink: Rink = {
            id: place.place_id || placeId,
            name: place.name || 'Unknown Rink',
            address: place.formatted_address || place.vicinity || 'No address available',
            position: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            photo: place.photos?.[0]?.getUrl(),
            rating: place.rating
          };
          
          resolve(rink);
        } else {
          console.error('❌ Places API error:', status);
          reject(new Error(`Places API error: ${status}`));
        }
      }
    );
  });
};
