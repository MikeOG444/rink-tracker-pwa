import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Container, Typography, Box } from '@mui/material';

/**
 * ActionHandler component
 * 
 * This component handles Firebase Auth action URLs and redirects to the appropriate page.
 * It's used as a bridge between Firebase's auth action handler and our app's pages.
 */
const ActionHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const oobCode = queryParams.get('oobCode');
    
    if (!mode || !oobCode) {
      // If we don't have the required parameters, redirect to the auth page
      navigate('/auth');
      return;
    }

    // For all action modes, redirect to the auth page
    // Firebase will handle the action (password reset, email verification, etc.)
    // and then redirect to our auth page
    navigate('/auth');
  }, [location, navigate]);

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, color: 'white' }}>
          Processing your request...
        </Typography>
      </Box>
    </Container>
  );
};

export default ActionHandler;
