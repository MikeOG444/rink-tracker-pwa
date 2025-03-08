import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Specialized error class for API-related errors
 */
export class ApiError extends AppError {
  statusCode?: number;
  
  constructor(
    message: string, 
    severity: ErrorSeverity = ErrorSeverity.ERROR, 
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message, ErrorCategory.API, severity, originalError);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  
  /**
   * Create a network error (connection issues)
   */
  static network(message: string, originalError?: unknown): ApiError {
    return new ApiError(`API network error: ${message}`, ErrorSeverity.ERROR, undefined, originalError);
  }
  
  /**
   * Create a timeout error
   */
  static timeout(message: string, originalError?: unknown): ApiError {
    return new ApiError(`API timeout: ${message}`, ErrorSeverity.WARNING, undefined, originalError);
  }
  
  /**
   * Create a not found error (404)
   */
  static notFound(resource: string, originalError?: unknown): ApiError {
    return new ApiError(`Resource not found: ${resource}`, ErrorSeverity.WARNING, 404, originalError);
  }
  
  /**
   * Create an unauthorized error (401)
   */
  static unauthorized(message: string, originalError?: unknown): ApiError {
    return new ApiError(`Unauthorized: ${message}`, ErrorSeverity.ERROR, 401, originalError);
  }
  
  /**
   * Create a forbidden error (403)
   */
  static forbidden(message: string, originalError?: unknown): ApiError {
    return new ApiError(`Forbidden: ${message}`, ErrorSeverity.ERROR, 403, originalError);
  }
  
  /**
   * Create a bad request error (400)
   */
  static badRequest(message: string, originalError?: unknown): ApiError {
    return new ApiError(`Bad request: ${message}`, ErrorSeverity.WARNING, 400, originalError);
  }
  
  /**
   * Create a server error (500)
   */
  static serverError(message: string, originalError?: unknown): ApiError {
    return new ApiError(`Server error: ${message}`, ErrorSeverity.ERROR, 500, originalError);
  }
  
  /**
   * Create a rate limit error (429)
   */
  static rateLimit(message: string, originalError?: unknown): ApiError {
    return new ApiError(`Rate limit exceeded: ${message}`, ErrorSeverity.WARNING, 429, originalError);
  }
  
  /**
   * Create an error from HTTP status code
   */
  static fromStatus(statusCode: number, message: string, originalError?: unknown): ApiError {
    let severity = ErrorSeverity.ERROR;
    let prefix = 'API error';
    
    if (statusCode >= 400 && statusCode < 500) {
      severity = ErrorSeverity.WARNING;
      prefix = statusCode === 404 ? 'Resource not found' : 'Client error';
    } else if (statusCode >= 500) {
      severity = ErrorSeverity.ERROR;
      prefix = 'Server error';
    }
    
    return new ApiError(`${prefix}: ${message}`, severity, statusCode, originalError);
  }
  
  /**
   * Create a Google Places API error
   */
  static places(status: string, message: string, originalError?: unknown): ApiError {
    let severity = ErrorSeverity.ERROR;
    
    // Map Google Places API status to appropriate severity
    switch (status) {
      case 'ZERO_RESULTS':
        severity = ErrorSeverity.INFO;
        break;
      case 'OVER_QUERY_LIMIT':
      case 'REQUEST_DENIED':
      case 'INVALID_REQUEST':
        severity = ErrorSeverity.WARNING;
        break;
      default:
        severity = ErrorSeverity.ERROR;
    }
    
    return new ApiError(`Google Places API error (${status}): ${message}`, severity, undefined, originalError);
  }
}
