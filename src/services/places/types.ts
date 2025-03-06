// Types and interfaces for the Google Places API

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

// Error types for Places API
export enum PlacesErrorType {
  ZERO_RESULTS = 'ZERO_RESULTS',
  OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
  REQUEST_DENIED = 'REQUEST_DENIED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  MAP_ERROR = 'MAP_ERROR'
}

export interface PlacesError {
  type: PlacesErrorType;
  message: string;
  originalError?: any;
}

// Search parameters for different types of searches
export interface TextSearchParams {
  query: string;
  type?: string;
}

export interface NearbySearchParams {
  location: google.maps.LatLngLiteral;
  radius: number;
  keyword?: string;
  type?: string;
}

export interface PlaceDetailsParams {
  placeId: string;
  fields?: string[];
}

// Generic type for search results
export type PlacesSearchResult = google.maps.places.PlaceResult[];
