import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ErrorHandler, ErrorSeverity } from '../../../services/error';

interface ErrorDisplayProps {
  error: string | Error | null;
  handleErrorClose: () => void;
  severity?: ErrorSeverity;
  autoHideDuration?: number;
}

/**
 * Component to display error messages in a snackbar
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  handleErrorClose,
  severity = ErrorSeverity.ERROR,
  autoHideDuration = 6000
}) => {
  // Format the error message if it's an Error object
  const errorMessage = error instanceof Error 
    ? ErrorHandler.formatErrorMessage(error)
    : error;
  
  // Map error severity to MUI severity
  const alertSeverity = (() => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'info';
      case ErrorSeverity.WARNING:
        return 'warning';
      case ErrorSeverity.ERROR:
        return 'error';
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  })();
  
  return (
    <Snackbar 
      open={!!error} 
      autoHideDuration={autoHideDuration} 
      onClose={handleErrorClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleErrorClose} 
        severity={alertSeverity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default ErrorDisplay;
