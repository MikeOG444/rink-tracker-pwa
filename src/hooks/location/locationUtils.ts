// Default center (will be replaced with user's location)
export const defaultCenter = {
  lat: 43.6532, // Toronto
  lng: -79.3832
};

// For testing purposes - hardcoded location
export const userActualLocation = {
  lat: 41.584,
  lng: -73.8087
};

// Location state types
export enum LocationState {
  IDLE = 'idle',
  LOCATING = 'locating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface LocationError {
  code?: number;
  message: string;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Default geolocation options
export const defaultLocationOptions: LocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

// Utility function to check if two locations are significantly different
export const areLocationsSignificantlyDifferent = (
  location1: google.maps.LatLngLiteral,
  location2: google.maps.LatLngLiteral,
  threshold: number = 0.001
): boolean => {
  return (
    Math.abs(location1.lat - location2.lat) > threshold ||
    Math.abs(location1.lng - location2.lng) > threshold
  );
};
