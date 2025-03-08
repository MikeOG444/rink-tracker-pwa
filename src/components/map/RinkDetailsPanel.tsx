import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Rink } from '../../services/placesAPI';
import { rinkVisitRepository } from '../../domain/repositories';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Rating,
  Skeleton,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsIcon from '@mui/icons-material/Directions';
import AddIcon from '@mui/icons-material/Add';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface RinkDetailsPanelProps {
  rink: Rink | null;
  onClose: () => void;
}

const RinkDetailsPanel = ({ rink, onClose }: RinkDetailsPanelProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const checkVisitStatus = async () => {
      if (rink && user) {
        setLoading(true);
        try {
          // Use the rinkVisitRepository to check if the user has visited the rink
          const visits = await rinkVisitRepository.findByUserIdAndRinkId(user.uid, rink.id);
          const visited = visits.length > 0;
          setHasVisited(visited);
          
          if (visited) {
            // Use the visit count from the repository
            setVisitCount(visits.length);
          }
        } catch (error) {
          console.error('Error checking visit status:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setHasVisited(false);
        setVisitCount(0);
        setLoading(false);
      }
    };

    checkVisitStatus();
  }, [rink, user]);

  const handleLogActivity = () => {
    if (!rink || !user) return;
    
    // Navigate to dashboard with rink info
    navigate('/dashboard', { 
      state: { 
        logActivity: true,
        rink: rink
      } 
    });
  };

  const handleGetDirections = () => {
    if (!rink) return;
    
    // Open Google Maps directions in a new tab
    const url = `https://www.google.com/maps/dir/?api=1&destination=${rink.position.lat},${rink.position.lng}&destination_place_id=${rink.id}`;
    window.open(url, '_blank');
  };

  if (!rink) return null;

  return (
    <Slide direction="up" in={!!rink} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '50vh',
          overflowY: 'auto',
          zIndex: 10000, // Higher than map controls (9999)
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 2,
          bgcolor: '#2A2A2A'
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.4)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Rink photo */}
        {rink.photo ? (
          <Box
            sx={{
              height: 150,
              width: '100%',
              backgroundImage: `url(${rink.photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              mb: 2
            }}
          />
        ) : (
          <Box
            sx={{
              height: 150,
              width: '100%',
              bgcolor: '#3A3A3A',
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlaceIcon sx={{ fontSize: 60, color: '#555' }} />
          </Box>
        )}

        {/* Rink name and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mr: 4 }}>
            {rink.name}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={32} />
          ) : (
            hasVisited && (
              <Chip 
                label={`Visited ${visitCount} ${visitCount === 1 ? 'time' : 'times'}`} 
                color="success" 
                size="small"
              />
            )
          )}
        </Box>

        {/* Rating */}
        {rink.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={rink.rating}
              precision={0.5}
              readOnly
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              icon={<StarIcon fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ ml: 1, color: '#CCC' }}>
              {rink.rating.toFixed(1)}
            </Typography>
          </Box>
        )}

        {/* Address */}
        <Typography variant="body1" sx={{ mb: 2, color: '#CCC' }}>
          {rink.address}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleLogActivity}
          >
            Log Activity
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            startIcon={<DirectionsIcon />}
            onClick={handleGetDirections}
          >
            Directions
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default RinkDetailsPanel;
