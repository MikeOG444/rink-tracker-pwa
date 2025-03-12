import { logger } from '../../services/logging';

/**
 * Type guard to check if an object is a GeolocationPositionError
 */
function isGeolocationPositionError(error: any): error is GeolocationPositionError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/**
 * Specialized error handler for geolocation issues
 */
export const GeolocationErrorHandler = {
  /**
   * Get a user-friendly error message based on the error
   */
  getErrorMessage(error: GeolocationPositionError | Error | string | number | null): string {
    // Handle GeolocationPositionError
    if (isGeolocationPositionError(error)) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          return 'Location access was denied. Please enable location services to find rinks near you.';
        case 2: // POSITION_UNAVAILABLE
          return 'Your current location could not be determined. Please try again later.';
        case 3: // TIMEOUT
          return 'Location request timed out. Please check your connection and try again.';
        default:
          return error.message || 'An unknown location error occurred.';
      }
    }
    
    // Handle Error objects
    if (error instanceof Error) {
      return error.message || 'Unknown error';
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }
    
    // Handle null/undefined
    if (error === null || error === undefined) {
      return 'Location services are unavailable.';
    }
    
    // Handle other types
    return String(error);
  },
  
  /**
   * Get actionable guidance based on the error
   */
  getErrorAction(error: GeolocationPositionError | Error | string | number | null): string {
    // Handle GeolocationPositionError
    if (isGeolocationPositionError(error)) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          return this.getBrowserSpecificPermissionInstructions();
        case 2: // POSITION_UNAVAILABLE
          return 'Try again later or enter your location manually.';
        case 3: // TIMEOUT
          return 'Check your internet connection and try again.';
        default:
          return 'Try entering your location manually.';
      }
    }
    
    return 'Try entering your location manually.';
  },
  
  /**
   * Get browser-specific instructions for enabling location permissions
   */
  getBrowserSpecificPermissionInstructions(): string {
    const browser = this.detectBrowser();
    
    switch (browser) {
      case 'chrome':
        return 'Click the lock icon in the address bar and set Location to Allow.';
      case 'firefox':
        return 'Click the lock icon in the address bar and set Location to Allow.';
      case 'safari':
        return 'Go to Settings > Safari > Location Services and enable for this website.';
      case 'edge':
        return 'Click the lock icon in the address bar and set Location to Allow.';
      default:
        return 'Check your browser settings to allow location access for this site.';
    }
  },
  
  /**
   * Detect the user's browser
   */
  detectBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1) {
      return 'chrome';
    }
    if (userAgent.indexOf('firefox') > -1) {
      return 'firefox';
    }
    if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
      return 'safari';
    }
    if (userAgent.indexOf('edge') > -1) {
      return 'edge';
    }
    
    return 'unknown';
  },
  
  /**
   * Log a geolocation error
   */
  logError(error: unknown): void {
    // Handle GeolocationPositionError
    if (isGeolocationPositionError(error)) {
      logger.warning(
        `Geolocation error: ${error.code} - ${error.message}`,
        'GeolocationService'
      );
      return;
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      logger.error(
        `Geolocation error: ${error.message || 'Unknown error'}`,
        'GeolocationService',
        error
      );
      return;
    }
    
    // Handle any other type of error
    logger.error(
      'Unknown geolocation error',
      'GeolocationService',
      error
    );
  }
};
