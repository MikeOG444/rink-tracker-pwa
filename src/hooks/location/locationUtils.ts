// Default center (will be used as fallback if geolocation fails)
export const defaultCenter = {
  lat: 43.6532, // Toronto
  lng: -79.3832
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
  timeout: 15000,  // Increased timeout to 15 seconds
  maximumAge: 60000 // Allow cached positions up to 1 minute old
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
