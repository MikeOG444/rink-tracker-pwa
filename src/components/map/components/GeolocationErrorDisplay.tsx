import React from 'react';
import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { GeolocationErrorHandler } from '../../../hooks/location/GeolocationErrorHandler';

interface GeolocationErrorDisplayProps {
  error: GeolocationPositionError | Error | string | null;
  onManualLocationClick: () => void;
}

/**
 * Component to display geolocation errors with actionable guidance
 */
const GeolocationErrorDisplay: React.FC<GeolocationErrorDisplayProps> = ({
  error,
  onManualLocationClick
}) => {
  if (!error) return null;
  
  // Get user-friendly error message and action guidance
  const errorMessage = typeof error === 'string' 
    ? error 
    : GeolocationErrorHandler.getErrorMessage(error);
  
  const actionGuidance = typeof error === 'string'
    ? 'Try setting your location manually.'
    : GeolocationErrorHandler.getErrorAction(error);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        sx={{ mb: 1 }}
      >
        <AlertTitle>Location Access Issue</AlertTitle>
        {errorMessage}
      </Alert>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {actionGuidance}
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LocationOnIcon />}
          onClick={onManualLocationClick}
          sx={{ alignSelf: 'flex-start' }}
        >
          Set Location Manually
        </Button>
      </Box>
    </Box>
  );
};

export default GeolocationErrorDisplay;
