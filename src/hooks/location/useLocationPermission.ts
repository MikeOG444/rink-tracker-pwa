import { useState, useEffect, useCallback } from 'react';
import { logger } from '../../services/logging';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable' | 'checking';

interface UseLocationPermissionReturn {
  permissionState: PermissionState;
  isSupported: boolean;
  requestPermission: () => Promise<PermissionState>;
  hasCheckedPermission: boolean;
}

/**
 * Hook to check and request location permission
 */
export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [hasCheckedPermission, setHasCheckedPermission] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check if geolocation is supported
  const checkGeolocationSupport = useCallback(() => {
    if (!navigator.geolocation) {
      logger.warning('Geolocation API is not supported in this browser');
      setIsSupported(false);
      setPermissionState('unavailable');
      return false;
    }
    return true;
  }, []);

  // Check permission status using Permissions API if available
  const checkPermissionStatus = useCallback(async (): Promise<PermissionState> => {
    if (!checkGeolocationSupport()) {
      return 'unavailable';
    }

    // Try using Permissions API if available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        logger.info(`Geolocation permission status: ${result.state}`);
        
        // Set up listener for permission changes
        result.addEventListener('change', () => {
          logger.info(`Geolocation permission changed to: ${result.state}`);
          setPermissionState(result.state as PermissionState);
        });
        
        return result.state as PermissionState;
      } catch (error) {
        logger.error('Error checking geolocation permission:', 'PermissionCheck', error);
      }
    }

    // Fallback: check if we have a saved permission state
    const savedState = localStorage.getItem('locationPermissionState');
    if (savedState && ['granted', 'denied', 'prompt'].includes(savedState)) {
      return savedState as PermissionState;
    }

    // If we can't determine, assume 'prompt'
    return 'prompt';
  }, [checkGeolocationSupport]);

  // Request permission function
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!checkGeolocationSupport()) {
      return 'unavailable';
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (_position) => {
          logger.info('Geolocation permission granted');
          setPermissionState('granted');
          localStorage.setItem('locationPermissionState', 'granted');
          resolve('granted');
        },
        (error) => {
          logger.warning(`Geolocation permission error: ${error.code} - ${error.message}`);
          // Error code 1 is permission denied
          const newState = error.code === 1 ? 'denied' : 'prompt';
          setPermissionState(newState);
          localStorage.setItem('locationPermissionState', newState);
          resolve(newState);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, [checkGeolocationSupport]);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const state = await checkPermissionStatus();
      setPermissionState(state);
      setHasCheckedPermission(true);
    };

    checkPermission();
  }, [checkPermissionStatus]);

  return {
    permissionState,
    isSupported,
    requestPermission,
    hasCheckedPermission
  };
};
