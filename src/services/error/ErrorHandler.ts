import { AppError, ErrorCategory, ErrorSeverity } from './AppError';
import { logger } from '../logging';

/**
 * Centralized error handler service
 */
export class ErrorHandler {
  /**
   * Log an error with appropriate severity and context
   * @param error The error to log
   * @param context Optional context information
   */
  static logError(error: AppError | Error | unknown, context?: string): void {
    // Convert to AppError if it's not already
    const appError = error instanceof AppError
      ? error
      : AppError.from(error);
    
    // Log the error using the logging service
    logger.logAppError(appError, context);
  }
  
  /**
   * Format an error message for display to the user
   * @param error The error to format
   * @returns A user-friendly error message
   */
  static formatErrorMessage(error: AppError | Error | unknown): string {
    // Convert to AppError if it's not already
    const appError = error instanceof AppError
      ? error
      : AppError.from(error);
    
    // Format based on error category
    switch (appError.category) {
      case ErrorCategory.NETWORK:
        return this.formatNetworkErrorMessage(appError);
      case ErrorCategory.AUTHENTICATION:
        return this.formatAuthErrorMessage(appError);
      case ErrorCategory.VALIDATION:
        return this.formatValidationErrorMessage(appError);
      case ErrorCategory.DATABASE:
        return this.formatDatabaseErrorMessage(appError);
      case ErrorCategory.API:
        return this.formatApiErrorMessage(appError);
      default:
        return appError.message || 'An unknown error occurred';
    }
  }
  
  /**
   * Handle an error with appropriate action
   * @param error The error to handle
   * @param fallback Optional fallback value to return
   * @param context Optional context information
   * @returns The fallback value if provided
   * @throws The error if no fallback is provided
   */
  static handleError<T>(error: unknown, fallback?: T, context?: string): T {
    // Convert to AppError if it's not already
    const appError = error instanceof AppError
      ? error
      : AppError.from(error);
    
    // Log the error
    this.logError(appError, context);
    
    // If a fallback is provided, return it
    if (fallback !== undefined) {
      return fallback;
    }
    
    // Otherwise, throw the error
    throw appError;
  }
  
  /**
   * Format a network error message
   */
  private static formatNetworkErrorMessage(error: AppError): string {
    if (error.message.includes('offline')) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('timeout')) {
      return 'The request timed out. Please try again later.';
    }
    
    return 'A network error occurred. Please check your connection and try again.';
  }
  
  /**
   * Format an authentication error message
   */
  private static formatAuthErrorMessage(error: AppError): string {
    // Return the message as is, as auth errors are usually already user-friendly
    return error.message;
  }
  
  /**
   * Format a validation error message
   */
  private static formatValidationErrorMessage(error: AppError): string {
    // Check if the error has a getUserMessage method (ValidationError)
    if (typeof (error as any).getUserMessage === 'function') {
      return (error as any).getUserMessage();
    }
    
    return error.message;
  }
  
  /**
   * Format a database error message
   */
  private static formatDatabaseErrorMessage(error: AppError): string {
    // For not found errors, return as is
    if (error.message.includes('not found')) {
      return error.message;
    }
    
    // For offline errors, provide a helpful message
    if (error.message.includes('offline')) {
      return 'You are currently offline. Your changes will be saved when you reconnect.';
    }
    
    // For other database errors, provide a generic message
    return 'A database error occurred. Please try again later.';
  }
  
  /**
   * Format an API error message
   */
  private static formatApiErrorMessage(error: AppError): string {
    // For Google Places API errors
    if (error.message.includes('Google Places API')) {
      if (error.message.includes('ZERO_RESULTS')) {
        return 'No results found. Please try a different search term.';
      }
      
      if (error.message.includes('OVER_QUERY_LIMIT')) {
        return 'Search limit exceeded. Please try again later.';
      }
      
      if (error.message.includes('REQUEST_DENIED')) {
        return 'Search request was denied. Please try again later.';
      }
      
      return 'An error occurred while searching. Please try again.';
    }
    
    // For other API errors
    return 'An error occurred while communicating with the server. Please try again later.';
  }
  
  /**
   * Get the appropriate severity level for an error
   * @param error The error to check
   * @returns The severity level
   */
  static getSeverity(error: AppError | Error | unknown): ErrorSeverity {
    if (error instanceof AppError) {
      return error.severity;
    }
    
    return ErrorSeverity.ERROR;
  }
  
  /**
   * Check if an error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.category === ErrorCategory.NETWORK;
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('offline') || 
             message.includes('internet') ||
             message.includes('connection');
    }
    
    return false;
  }
  
  /**
   * Check if an error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.category === ErrorCategory.AUTHENTICATION;
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('auth') || 
             message.includes('login') || 
             message.includes('permission') ||
             message.includes('unauthorized');
    }
    
    return false;
  }
  
  /**
   * Check if an error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.category === ErrorCategory.VALIDATION;
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('validation') || 
             message.includes('invalid') || 
             message.includes('required');
    }
    
    return false;
  }
}
