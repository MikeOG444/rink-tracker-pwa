import { logger } from '../logging';

/**
 * Service to manage user location preferences
 */
export const LocationPreferences = {
  /**
   * Storage key for default location
   */
  STORAGE_KEY: 'userDefaultLocation',
  
  /**
   * Save a default location to localStorage
   */
  saveDefaultLocation: (location: google.maps.LatLngLiteral): void => {
    try {
      localStorage.setItem(
        LocationPreferences.STORAGE_KEY,
        JSON.stringify(location)
      );
      logger.info('Default location saved', 'LocationPreferences', location);
    } catch (error) {
      logger.error('Failed to save default location', 'LocationPreferences', error);
    }
  },
  
  /**
   * Get the default location from localStorage
   */
  getDefaultLocation: (): google.maps.LatLngLiteral | null => {
    try {
      const stored = localStorage.getItem(LocationPreferences.STORAGE_KEY);
      if (!stored) return null;
      
      const location = JSON.parse(stored) as google.maps.LatLngLiteral;
      
      // Validate the location object
      if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        logger.warning('Invalid location data in localStorage', 'LocationPreferences');
        return null;
      }
      
      return location;
    } catch (error) {
      logger.error('Failed to get default location', 'LocationPreferences', error);
      return null;
    }
  },
  
  /**
   * Check if a default location is set
   */
  hasDefaultLocation: (): boolean => {
    return localStorage.getItem(LocationPreferences.STORAGE_KEY) !== null;
  },
  
  /**
   * Clear the default location
   */
  clearDefaultLocation: (): void => {
    try {
      localStorage.removeItem(LocationPreferences.STORAGE_KEY);
      logger.info('Default location cleared', 'LocationPreferences');
    } catch (error) {
      logger.error('Failed to clear default location', 'LocationPreferences', error);
    }
  }
};
