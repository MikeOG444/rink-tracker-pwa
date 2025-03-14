import { logger } from '../logging';
import { defaultCenter } from '../../hooks/location/locationUtils';

export interface GeolocationResult {
  location: google.maps.LatLngLiteral | null;
  error: GeolocationError | null;
  timestamp: number;
}

export interface GeolocationError {
  code?: number;
  message: string;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const STORAGE_KEY = 'userGeolocation';
const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000
};

class GeolocationService {
  private static instance: GeolocationService;
  private lastResult: GeolocationResult | null = null;
  private pendingRequest: Promise<GeolocationResult> | null = null;
  private subscribers: Set<(result: GeolocationResult) => void> = new Set();
  private isLocating: boolean = false;

  private constructor() {
    // Load cached result from localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        this.lastResult = JSON.parse(cached);
        logger.info('Loaded cached geolocation', 'GeolocationService');
        
        // Store in debug object
        if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
          window.__RINK_TRACKER_DEBUG__.cachedLocation = this.lastResult?.location || null;
        }
      }
    } catch (error) {
      logger.error('Failed to load cached geolocation', 'GeolocationService', error);
    }
  }

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Get the current location, either from cache or by making a new request
   * @param forceRefresh Force a new request even if cached data is available
   * @param options Geolocation options
   */
  public async getCurrentLocation(
    forceRefresh = false,
    options: GeolocationOptions = DEFAULT_OPTIONS
  ): Promise<GeolocationResult> {
    // If we have a cached result and it's not a forced refresh, return it
    if (this.lastResult && !forceRefresh) {
      return this.lastResult;
    }

    // If there's already a pending request, return that promise
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // Set locating state
    this.isLocating = true;
    this.notifySubscribers();

    // Start a new geolocation request
    this.pendingRequest = new Promise<GeolocationResult>((resolve) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const result: GeolocationResult = {
          location: null,
          error: { message: 'Geolocation is not supported by this browser' },
          timestamp: Date.now()
        };
        this.updateResult(result);
        this.isLocating = false;
        this.notifySubscribers();
        resolve(result);
        return;
      }

      // Request position
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const result: GeolocationResult = {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            error: null,
            timestamp: Date.now()
          };
          this.updateResult(result);
          this.isLocating = false;
          this.notifySubscribers();
          resolve(result);
        },
        // Error callback
        (error) => {
          let errorMessage = error.message;
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
          } else if (error.code === 2) {
            errorMessage = 'Unable to determine your location. Please check your connection or try again.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }

          const result: GeolocationResult = {
            location: null,
            error: {
              code: error.code,
              message: errorMessage
            },
            timestamp: Date.now()
          };
          this.updateResult(result);
          this.isLocating = false;
          this.notifySubscribers();
          resolve(result);
        },
        // Options
        options as PositionOptions
      );
    });

    // Clear the pending request reference when done
    const result = await this.pendingRequest;
    this.pendingRequest = null;
    return result;
  }

  /**
   * Get the default location (Toronto)
   */
  public getDefaultLocation(): google.maps.LatLngLiteral {
    return defaultCenter;
  }

  /**
   * Get the best available location (user location or default)
   */
  public getBestAvailableLocation(): google.maps.LatLngLiteral {
    if (this.lastResult?.location) {
      return this.lastResult.location;
    }
    return this.getDefaultLocation();
  }

  /**
   * Check if the service is currently getting location
   */
  public isCurrentlyLocating(): boolean {
    return this.isLocating;
  }

  /**
   * Subscribe to location updates
   * @param callback Function to call when location changes
   * @returns Unsubscribe function
   */
  public subscribe(callback: (result: GeolocationResult) => void): () => void {
    this.subscribers.add(callback);
    
    // If we already have a result, call the callback immediately
    if (this.lastResult) {
      callback(this.lastResult);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Set a manual location
   */
  public setManualLocation(location: google.maps.LatLngLiteral): void {
    const result: GeolocationResult = {
      location,
      error: null,
      timestamp: Date.now()
    };
    this.updateResult(result);
  }

  /**
   * Update the result and notify subscribers
   */
  private updateResult(result: GeolocationResult): void {
    this.lastResult = result;
    
    // Cache in localStorage if we have a location
    if (result.location) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        
        // Store in debug object
        if (typeof window !== 'undefined' && window.__RINK_TRACKER_DEBUG__) {
          window.__RINK_TRACKER_DEBUG__.userLocation = result.location;
        }
      } catch (error) {
        logger.error('Failed to cache geolocation', 'GeolocationService', error);
      }
    }
    
    this.notifySubscribers();
  }

  /**
   * Notify all subscribers of the current state
   */
  private notifySubscribers(): void {
    // Create a state object with all relevant information
    const state = {
      location: this.lastResult?.location || null,
      error: this.lastResult?.error || null,
      isLocating: this.isLocating,
      timestamp: this.lastResult?.timestamp || Date.now()
    };
    
    // Notify subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(state as GeolocationResult);
      } catch (error) {
        logger.error('Error in geolocation subscriber callback', 'GeolocationService', error);
      }
    });
  }
}

// Export a singleton instance
export const geolocationService = GeolocationService.getInstance();
