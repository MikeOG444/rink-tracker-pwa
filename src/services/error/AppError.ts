/**
 * Enum for error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Enum for error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  API = 'api',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  originalError?: unknown;
  
  constructor(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN, 
    severity: ErrorSeverity = ErrorSeverity.ERROR, 
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date();
    this.originalError = originalError;
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, AppError.prototype);
  }
  
  /**
   * Create a network error
   */
  static network(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.NETWORK, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an authentication error
   */
  static auth(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an authorization error
   */
  static authorization(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.AUTHORIZATION, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a validation error
   */
  static validation(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.VALIDATION, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a database error
   */
  static database(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.DATABASE, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an API error
   */
  static api(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.API, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a UI error
   */
  static ui(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.UI, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an unknown error
   */
  static unknown(message: string, originalError?: unknown): AppError {
    return new AppError(message, ErrorCategory.UNKNOWN, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Convert any error to an AppError
   */
  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(error.message, ErrorCategory.UNKNOWN, ErrorSeverity.ERROR, error);
    }
    
    return new AppError(
      typeof error === 'string' ? error : 'An unknown error occurred',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.ERROR,
      error
    );
  }
}
