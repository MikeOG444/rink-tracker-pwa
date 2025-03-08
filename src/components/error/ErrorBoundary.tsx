import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorCategory, ErrorHandler, ErrorSeverity } from '../../services/error';
import { Alert, Button, Typography, Box, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle errors in the UI
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, resetError) => (
 *     <div>
 *       <h2>Something went wrong</h2>
 *       <p>{error.message}</p>
 *       <button onClick={resetError}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Convert to AppError if it's not already
    const appError = error instanceof AppError
      ? error
      : new AppError(
          error.message,
          ErrorCategory.UI,
          ErrorSeverity.ERROR,
          error
        );
    
    // Log the error
    ErrorHandler.logError(appError, 'ErrorBoundary');
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  /**
   * Reset the error state to allow the component to try rendering again
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        if (React.isValidElement(this.props.fallback)) {
          return this.props.fallback;
        }
        
        const FallbackComponent = this.props.fallback as React.ComponentType<{ error: Error; resetError: () => void }>;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }
      
      // Default error UI
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            p: 2
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              maxWidth: '500px', 
              width: '100%',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ my: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Alert>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              The application encountered an unexpected error. You can try again or refresh the page.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.resetError}
              sx={{ mr: 1 }}
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Paper>
        </Box>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with an error boundary
 * 
 * Usage:
 * ```tsx
 * const SafeComponent = withErrorBoundary(YourComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
