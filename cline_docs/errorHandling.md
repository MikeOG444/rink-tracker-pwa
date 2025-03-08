# Rink Tracker PWA - Error Handling and Logging

## Introduction

This document explains the error handling and logging system implemented in the Rink Tracker PWA. A robust error handling system is crucial for maintaining application stability, providing a good user experience, and facilitating debugging.

## Error Handling Architecture

The error handling system follows a hierarchical approach with several key components:

1. **Custom Error Classes**: A hierarchy of error classes for different error types
2. **Centralized Error Handler**: A service for consistent error handling
3. **React Error Boundaries**: Components for graceful UI error handling
4. **Structured Logging**: A logging service with different log levels and contexts

## Custom Error Classes

### Error Hierarchy

```
AppError (Base class)
├── ApiError
│   └── PlacesApiError
├── AuthError
├── DatabaseError
│   └── FirestoreError
├── NetworkError
└── ValidationError
```

### Base Error Class: `AppError`

The `AppError` class serves as the base for all application-specific errors:

```typescript
export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: Date;
  public readonly originalError?: Error;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.GENERAL,
    originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date();
    this.originalError = originalError;
  }
}
```

### Specialized Error Classes

Each specialized error class extends `AppError` and adds specific functionality:

- **ApiError**: For errors related to external API calls
- **AuthError**: For authentication and authorization errors
- **DatabaseError**: For database-related errors
- **NetworkError**: For network connectivity issues
- **ValidationError**: For data validation errors

### Error Factory Methods

Each error class provides factory methods for common error scenarios:

```typescript
// Example from ApiError.ts
static notFound(resource: string, details?: string): ApiError {
  const message = `Resource not found: ${resource}${details ? ` (${details})` : ''}`;
  return new ApiError(message, ErrorSeverity.WARNING, ErrorCategory.API, ApiErrorType.NOT_FOUND);
}
```

## Centralized Error Handler

The `ErrorHandler` service provides centralized error handling:

```typescript
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  handleError(error: Error | AppError, context?: string): void {
    const appError = this.normalizeError(error);
    
    // Log the error
    this.logError(appError, context);
    
    // Additional handling based on error type and severity
    this.processError(appError, context);
  }
  
  // Other methods...
}
```

### Key Features of the Error Handler

1. **Error Normalization**: Converts standard errors to `AppError` instances
2. **Contextual Logging**: Logs errors with context information
3. **Severity-Based Handling**: Different handling based on error severity
4. **User Feedback**: Provides user-friendly error messages
5. **Recovery Strategies**: Implements recovery strategies for certain errors

## React Error Boundaries

React Error Boundaries catch JavaScript errors in the component tree:

```typescript
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(error, 'ErrorBoundary');
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.resetError)
      ) : (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <button onClick={this.resetError}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Using Error Boundaries

Error boundaries are used to wrap components that might throw errors:

```jsx
<ErrorBoundary
  fallback={(error, resetError) => (
    <ErrorDisplay error={error} onRetry={resetError} />
  )}
>
  <MapContainer />
</ErrorBoundary>
```

## Structured Logging

The `LoggingService` provides structured logging with different log levels:

```typescript
export class LoggingService {
  private static instance: LoggingService;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  
  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }
  
  log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level >= this.logLevel) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context,
        data
      };
      
      // Add to in-memory logs
      this.logs.push(entry);
      
      // Output to console with appropriate styling
      this.outputToConsole(entry);
      
      // Send to monitoring service if enabled and level is high enough
      if (this.monitoringEnabled && level >= LogLevel.ERROR) {
        this.sendToMonitoringService(entry);
      }
    }
  }
  
  // Convenience methods for different log levels
  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }
  
  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }
  
  warning(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARNING, message, context, data);
  }
  
  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }
  
  critical(message: string, context?: string, data?: any): void {
    this.log(LogLevel.CRITICAL, message, context, data);
  }
  
  // Other methods...
}
```

### Log Levels

The logging system supports different log levels:

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about system operation
- **WARNING**: Potential issues that don't affect core functionality
- **ERROR**: Errors that affect functionality but don't crash the application
- **CRITICAL**: Severe errors that might crash the application

### Context-Aware Logging

Logs include context information for better debugging:

```typescript
logger.error("Failed to fetch rink data", "RinkSearchService", { query: "hockey rink" });
```

### Environment-Specific Logging

Logging behavior changes based on the environment:

- **Development**: All logs are output to the console with styling
- **Test**: Only warnings and errors are logged
- **Production**: Only errors and critical logs are stored, with critical logs sent to a monitoring service

## Integration with UI Components

### Error Display Component

The `ErrorDisplay` component shows user-friendly error messages:

```jsx
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const errorMessage = getErrorMessage(error);
  const isRetryable = isRetryableError(error);
  
  return (
    <div className="error-display">
      <div className="error-icon">
        <ErrorIcon />
      </div>
      <div className="error-content">
        <h3>Something went wrong</h3>
        <p>{errorMessage}</p>
        {isRetryable && onRetry && (
          <button onClick={onRetry}>Try Again</button>
        )}
      </div>
    </div>
  );
};
```

### Loading States with Error Handling

Components handle loading states and errors consistently:

```jsx
const MapContainer: React.FC = () => {
  const { isLoading, error, data } = useMapData();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }
  
  return <Map data={data} />;
};
```

## Best Practices for Error Handling

### 1. Use Custom Error Classes

Create and throw appropriate custom error classes:

```typescript
if (!user) {
  throw AuthError.notAuthenticated("User must be logged in to view this page");
}
```

### 2. Handle Errors at the Right Level

Handle errors at the level where you have enough context to make a decision:

```typescript
try {
  await repository.save(activity);
} catch (error) {
  if (error instanceof DatabaseError) {
    // Handle database errors
    showNotification("Failed to save activity. Please try again later.");
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    setFormErrors(error.validationErrors);
  } else {
    // Handle other errors
    ErrorHandler.getInstance().handleError(error, "ActivityForm");
    showNotification("An unexpected error occurred.");
  }
}
```

### 3. Provide Context in Logs

Always include context in logs for easier debugging:

```typescript
logger.info("User logged in successfully", "AuthService", { userId });
```

### 4. Use Error Boundaries Strategically

Place error boundaries around key components to prevent the entire app from crashing:

```jsx
<ErrorBoundary>
  <MapPage />
</ErrorBoundary>

<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

### 5. Implement Retry Mechanisms

For transient errors, implement retry mechanisms:

```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (!isRetryableError(error) || retries === maxRetries - 1) {
        throw error;
      }
      
      retries++;
      await delay(getBackoffTime(retries));
      logger.warning(`Retrying fetch (${retries}/${maxRetries})`, "fetchWithRetry", { url });
    }
  }
}
```

## Conclusion

The error handling and logging system in Rink Tracker PWA provides a robust foundation for maintaining application stability and facilitating debugging. By following the patterns and best practices outlined in this document, new engineers can contribute to the project while maintaining consistent error handling.

For more details on specific error handling scenarios, refer to the relevant source files and the architecture documentation.
