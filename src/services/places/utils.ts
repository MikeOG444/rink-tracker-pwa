import { Rink, PlacesError, PlacesErrorType } from './types';

/**
 * Creates a Places Service instance
 * @param map Google Maps instance
 * @returns Places Service instance
 */
export const createPlacesService = (map: google.maps.Map): google.maps.places.PlacesService => {
  if (!map) {
    throw new Error('Map is required to create Places Service');
  }
  return new google.maps.places.PlacesService(map);
};

/**
 * Convert a Google Place result to our Rink interface
 * @param place Google Places result
 * @returns Rink object
 */
export const convertPlaceToRink = (place: google.maps.places.PlaceResult): Rink => {
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

/**
 * Calculate the radius that covers the visible area of the map
 * @param bounds Map bounds
 * @returns Radius in meters
 */
export const calculateMapRadius = (bounds: google.maps.LatLngBounds): number => {
  if (!bounds) {
    return 5000; // Default radius of 5km
  }
  
  // Get the center of the current bounds
  const center = bounds.getCenter();
  if (!center) {
    return 5000;
  }
  
  // Calculate the diagonal distance in meters (approximate)
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  // Calculate the diagonal distance in meters (approximate)
  const latDiff = Math.abs(ne.lat() - sw.lat());
  const lngDiff = Math.abs(ne.lng() - sw.lng());
  
  // Convert to meters (very approximate)
  const latMeters = latDiff * 111000; // 1 degree lat is about 111km
  const lngMeters = lngDiff * 111000 * Math.cos(center.lat() * Math.PI / 180);
  
  // Use the diagonal distance as radius
  return Math.sqrt(latMeters * latMeters + lngMeters * lngMeters) / 2;
};

/**
 * Handle Places API response
 * @param results Results from Places API
 * @param status Status from Places API
 * @param resolve Promise resolve function
 * @param reject Promise reject function
 */
export const handlePlacesAPIResponse = <T>(
  results: T | null,
  status: google.maps.places.PlacesServiceStatus,
  resolve: (value: T) => void,
  reject: (reason: PlacesError) => void
): void => {
  if (status === google.maps.places.PlacesServiceStatus.OK && results) {
    resolve(results);
  } else {
    const error: PlacesError = {
      type: PlacesErrorType.UNKNOWN_ERROR,
      message: `Places API error: ${status}`
    };
    
    // Map Google Places API status to our error types
    switch (status) {
      case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
        error.type = PlacesErrorType.ZERO_RESULTS;
        error.message = 'No results found';
        // For ZERO_RESULTS, we resolve with empty array instead of rejecting
        if (Array.isArray(results)) {
          resolve([] as unknown as T);
          return;
        }
        break;
      case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
        error.type = PlacesErrorType.OVER_QUERY_LIMIT;
        error.message = 'Query limit exceeded';
        break;
      case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
        error.type = PlacesErrorType.REQUEST_DENIED;
        error.message = 'Request denied';
        break;
      case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
        error.type = PlacesErrorType.INVALID_REQUEST;
        error.message = 'Invalid request';
        break;
      case google.maps.places.PlacesServiceStatus.NOT_FOUND:
        error.type = PlacesErrorType.NOT_FOUND;
        error.message = 'Place not found';
        break;
    }
    
    console.error('❌ Places API error:', error.message);
    reject(error);
  }
};

/**
 * Execute a Google Places API request with proper error handling
 * @param requestFn Function that makes the Places API request
 * @param params Parameters for the request
 * @returns Promise with the results
 */
export const executeGooglePlacesRequest = <T, P>(
  requestFn: (params: P, callback: (results: T | null, status: google.maps.places.PlacesServiceStatus) => void) => void,
  params: P
): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      requestFn(params, (results, status) => {
        handlePlacesAPIResponse(results, status, resolve, reject);
      });
    } catch (error) {
      console.error('❌ Exception in Places API request:', error);
      reject({
        type: PlacesErrorType.NETWORK_ERROR,
        message: 'Exception in Places API request',
        originalError: error
      });
    }
  });
};
