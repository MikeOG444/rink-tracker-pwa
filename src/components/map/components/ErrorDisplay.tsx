import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface ErrorDisplayProps {
  error: string | null;
  handleErrorClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  handleErrorClose
}) => {
  return (
    <Snackbar 
      open={!!error} 
      autoHideDuration={6000} 
      onClose={handleErrorClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorDisplay;
