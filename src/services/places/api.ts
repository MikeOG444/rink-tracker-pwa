import { 
  Rink, 
  TextSearchParams, 
  NearbySearchParams, 
  PlaceDetailsParams,
  PlacesSearchResult
} from './types';
import { 
  createPlacesService, 
  convertPlaceToRink, 
  calculateMapRadius, 
  executeGooglePlacesRequest 
} from './utils';

/**
 * Search for rinks by name using Places API Text Search
 * @param query Search query
 * @param map Google Maps instance
 * @returns Promise with array of Rink objects
 */
export const searchRinksByName = (
  query: string,
  map: google.maps.Map
): Promise<Rink[]> => {
  if (!query.trim()) {
    return Promise.resolve([]);
  }

  console.log('🔍 Searching for rinks with query:', query);
  
  // Create a Places Service instance
  const service = createPlacesService(map);
  
  // Set up search parameters
  const params: TextSearchParams = {
    query: `${query} ice rink hockey`,
    type: 'establishment'
  };
  
  // Execute the request
  return executeGooglePlacesRequest<PlacesSearchResult, TextSearchParams>(
    service.textSearch.bind(service),
    params
  ).then(results => {
    console.log('✅ Found', results.length, 'results for query:', query);
    return results.map(convertPlaceToRink);
  });
};

/**
 * Find nearby rinks using Places API Nearby Search
 * @param location Center location
 * @param radius Search radius in meters
 * @param map Google Maps instance
 * @returns Promise with array of Rink objects
 */
export const findNearbyRinks = (
  location: google.maps.LatLngLiteral,
  radius: number = 80467, // Default to 50 miles in meters
  map: google.maps.Map
): Promise<Rink[]> => {
  console.log('🔍 Finding nearby rinks within', radius / 1609, 'miles');
  
  // Create a Places Service instance
  const service = createPlacesService(map);
  
  // Set up search parameters
  const params: NearbySearchParams = {
    location: location,
    radius: radius,
    keyword: 'ice rink hockey',
    type: 'establishment'
  };
  
  // Execute the request
  return executeGooglePlacesRequest<PlacesSearchResult, NearbySearchParams>(
    service.nearbySearch.bind(service),
    params
  ).then(results => {
    console.log('✅ Found', results.length, 'nearby rinks');
    return results.map(convertPlaceToRink);
  });
};

/**
 * Find rinks in the current map bounds
 * @param map Google Maps instance
 * @returns Promise with array of Rink objects
 */
export const findRinksInMapBounds = (
  map: google.maps.Map
): Promise<Rink[]> => {
  const bounds = map.getBounds();
  if (!bounds) {
    console.error('❌ Map bounds not available');
    return Promise.resolve([]);
  }
  
  console.log('🔍 Finding rinks in current map view');
  
  // Get the center of the current bounds
  const center = bounds.getCenter();
  if (!center) {
    console.error('❌ Could not get center of map bounds');
    return Promise.resolve([]);
  }
  
  // Calculate the radius that covers the visible area
  const radius = calculateMapRadius(bounds);
  console.log('🔍 Search radius:', Math.round(radius), 'meters');
  
  // Use the findNearbyRinks function with the calculated center and radius
  return findNearbyRinks(
    { lat: center.lat(), lng: center.lng() },
    radius,
    map
  );
};

/**
 * Get detailed information about a specific rink
 * @param placeId Google Places ID
 * @param map Google Maps instance
 * @returns Promise with Rink object
 */
export const getRinkDetails = (
  placeId: string,
  map: google.maps.Map
): Promise<Rink> => {
  console.log('🔍 Getting details for rink:', placeId);
  
  // Create a Places Service instance
  const service = createPlacesService(map);
  
  // Set up request parameters
  const params: PlaceDetailsParams = {
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
  };
  
  // Execute the request
  return executeGooglePlacesRequest<google.maps.places.PlaceResult, PlaceDetailsParams>(
    service.getDetails.bind(service),
    params
  ).then(place => {
    console.log('✅ Got details for rink:', place.name);
    return convertPlaceToRink(place);
  });
};
