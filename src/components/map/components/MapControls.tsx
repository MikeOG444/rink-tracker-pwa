import React from 'react';
import { Box, Paper, IconButton, CircularProgress } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NearMeIcon from '@mui/icons-material/NearMe';

interface MapControlsProps {
  isLocating: boolean;
  isSearching: boolean;
  handleMyLocationClick: () => void;
  findRinksInView: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  isLocating,
  isSearching,
  handleMyLocationClick,
  findRinksInView
}) => {
  return (
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
          onClick={handleMyLocationClick}
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
        >
          {isLocating ? 
            <CircularProgress size={24} /> : 
            <MyLocationIcon fontSize="medium" color="primary" />
          }
        </IconButton>
      </Paper>
      
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
  );
};

export default MapControls;
