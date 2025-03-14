// Global type definitions for the application

// Extend the Window interface to include our debug object
interface Window {
  __RINK_TRACKER_DEBUG__?: {
    userLocation?: {
      lat: number;
      lng: number;
      accuracy?: number;
      timestamp?: string;
    };
    mapCenter?: {
      lat: number;
      lng: number;
    };
    cachedLocation?: {
      lat: number;
      lng: number;
    } | null;
    fallbackLocation?: {
      lat: number;
      lng: number;
    };
    usingFallback?: boolean;
    [key: string]: any;
  };
}
