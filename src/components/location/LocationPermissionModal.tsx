import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useLocationPermission } from '../../hooks/location/useLocationPermission';
import { GeolocationErrorHandler } from '../../hooks/location/GeolocationErrorHandler';

interface LocationPermissionModalProps {
  open: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onSkip?: () => void;
}

/**
 * Modal component for requesting location permission
 */
const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  open,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
  onSkip
}) => {
  const { permissionState, isSupported, requestPermission, hasCheckedPermission } = useLocationPermission();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle permission state changes
  useEffect(() => {
    if (hasCheckedPermission) {
      if (permissionState === 'granted') {
        onPermissionGranted?.();
      } else if (permissionState === 'denied') {
        onPermissionDenied?.();
      }
    }
  }, [permissionState, hasCheckedPermission, onPermissionGranted, onPermissionDenied]);
  
  // Handle request permission button click
  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        onPermissionGranted?.();
      } else if (result === 'denied') {
        setError('Location access was denied. Please enable location services in your browser settings.');
        onPermissionDenied?.();
      }
    } catch (err) {
      // Cast the unknown error to a more specific type
      const error = err as Error;
      setError(GeolocationErrorHandler.getErrorMessage(error));
      GeolocationErrorHandler.logError(error);
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Handle skip button click
  const handleSkip = () => {
    onSkip?.();
    onClose();
  };
  
  // Render content based on permission state
  const renderContent = () => {
    if (!isSupported) {
      return (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your browser doesn't support geolocation. Some features may not work properly.
          </Alert>
          <Typography variant="body1">
            Without location access, you'll need to manually search for rinks instead of seeing ones near you.
          </Typography>
        </>
      );
    }
    
    if (permissionState === 'denied') {
      return (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Location access is currently denied.
          </Alert>
          <Typography variant="body1" gutterBottom>
            To enable location access:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
            {GeolocationErrorHandler.getBrowserSpecificPermissionInstructions()}
          </Typography>
          <Typography variant="body1">
            Without location access, you'll need to manually search for rinks instead of seeing ones near you.
          </Typography>
        </>
      );
    }
    
    return (
      <>
        <Typography variant="body1" gutterBottom>
          Rink Tracker uses your location to:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MyLocationIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">Show hockey rinks near you</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">Verify your visits to rinks</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MyLocationIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">Provide directions to rinks</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your location is only used while you're using the app and is never shared with other users.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="location-permission-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="location-permission-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Location Access</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSkip} color="inherit">
          Skip for Now
        </Button>
        {permissionState !== 'denied' && isSupported && (
          <Button
            onClick={handleRequestPermission}
            color="primary"
            variant="contained"
            disabled={isRequesting}
            startIcon={isRequesting ? <CircularProgress size={20} color="inherit" /> : <LocationOnIcon />}
          >
            {isRequesting ? 'Requesting...' : 'Allow Location Access'}
          </Button>
        )}
        {permissionState === 'denied' && (
          <Button
            onClick={onClose}
            color="primary"
            variant="contained"
          >
            Got It
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LocationPermissionModal;
