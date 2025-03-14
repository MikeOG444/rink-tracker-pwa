import React, { useState } from 'react';
import { Box, Paper, IconButton, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NearMeIcon from '@mui/icons-material/NearMe';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ManualLocationSelector from '../../location/ManualLocationSelector';

interface MapControlsProps {
  isLocating: boolean;
  isSearching: boolean;
  onLocationUpdate: () => void;
  findRinksInView: () => void;
  setManualLocation?: (location: google.maps.LatLngLiteral) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  isLocating,
  isSearching,
  onLocationUpdate,
  findRinksInView,
  setManualLocation
}) => {
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  // Handle manual location selection
  const handleManualLocationSelected = (location: google.maps.LatLngLiteral) => {
    if (setManualLocation) {
      setManualLocation(location);
    }
    setShowLocationSelector(false);
  };
  
  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 30, left: 30, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* My Location button */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <IconButton
            color="default"
            onClick={onLocationUpdate}
            disabled={isLocating}
            sx={{ 
              backgroundColor: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
            size="large"
            title="Use my current location"
          >
            {isLocating ? 
              <CircularProgress size={24} /> : 
              <MyLocationIcon fontSize="medium" color="primary" />
            }
          </IconButton>
        </Paper>
        
        {/* Manual Location button */}
        {setManualLocation && (
          <Paper
            elevation={4}
            sx={{
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <IconButton
              color="default"
              onClick={() => setShowLocationSelector(true)}
              sx={{ 
                backgroundColor: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                }
              }}
              size="large"
              title="Set location manually"
            >
              <LocationOnIcon fontSize="medium" color="primary" />
            </IconButton>
          </Paper>
        )}
        
        {/* Find Rinks in View button */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <IconButton
            color="default"
            onClick={findRinksInView}
            disabled={isSearching}
            sx={{ 
              backgroundColor: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
            size="large"
            title="Find rinks in current map view"
          >
            {isSearching ? 
              <CircularProgress size={24} /> : 
              <NearMeIcon fontSize="medium" color="secondary" />
            }
          </IconButton>
        </Paper>
      </Box>
      
      {/* Manual Location Selector Dialog */}
      <ManualLocationSelector
        open={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelected={handleManualLocationSelected}
      />
    </>
  );
};

export default MapControls;
