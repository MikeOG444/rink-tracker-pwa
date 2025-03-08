// Export all error classes and types from a single entry point

export { AppError, ErrorCategory, ErrorSeverity } from './AppError';
export { ApiError } from './ApiError';
export { AuthError } from './AuthError';
export { DatabaseError } from './DatabaseError';
export { NetworkError } from './NetworkError';
export { ValidationError } from './ValidationError';
export type { ValidationErrorDetail } from './ValidationError';
export { ErrorHandler } from './ErrorHandler';

// Re-export common error creation functions for convenience
import { AppError } from './AppError';
import { ApiError } from './ApiError';
import { AuthError } from './AuthError';
import { DatabaseError } from './DatabaseError';
import { NetworkError } from './NetworkError';
import { ValidationError } from './ValidationError';

/**
 * Convert any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  return AppError.from(error);
}

/**
 * Create an API error from a Google Places API status
 */
export function createPlacesApiError(status: string, message: string, originalError?: unknown): ApiError {
  return ApiError.places(status, message, originalError);
}

/**
 * Create an auth error from a Firebase error code
 */
export function createFirebaseAuthError(errorCode: string, originalError?: unknown): AuthError {
  return AuthError.fromFirebaseError(errorCode, originalError);
}

/**
 * Create a database error for a not found entity
 */
export function createNotFoundError(entity: string, id: string, originalError?: unknown): DatabaseError {
  return DatabaseError.notFound(entity, id, originalError);
}

/**
 * Create a network offline error
 */
export function createOfflineError(message?: string, originalError?: unknown): NetworkError {
  return NetworkError.offline(message, originalError);
}

/**
 * Create a validation error for a required field
 */
export function createRequiredFieldError(field: string, originalError?: unknown): ValidationError {
  return ValidationError.required(field, originalError);
}
