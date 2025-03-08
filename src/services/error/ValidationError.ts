import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Interface for validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

/**
 * Specialized error class for validation-related errors
 */
export class ValidationError extends AppError {
  details: ValidationErrorDetail[];
  
  constructor(
    message: string, 
    details: ValidationErrorDetail[] = [],
    severity: ErrorSeverity = ErrorSeverity.WARNING, 
    originalError?: unknown
  ) {
    super(message, ErrorCategory.VALIDATION, severity, originalError);
    this.name = 'ValidationError';
    this.details = details;
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Create a validation error for a single field
   */
  static field(field: string, message: string, value?: any, originalError?: unknown): ValidationError {
    const detail: ValidationErrorDetail = { field, message, value };
    return new ValidationError(
      `Validation error: ${field} ${message}`, 
      [detail], 
      ErrorSeverity.WARNING, 
      originalError
    );
  }
  
  /**
   * Create a validation error for multiple fields
   */
  static fields(details: ValidationErrorDetail[], originalError?: unknown): ValidationError {
    const fieldsStr = details.map(d => d.field).join(', ');
    return new ValidationError(
      `Validation errors in fields: ${fieldsStr}`, 
      details, 
      ErrorSeverity.WARNING, 
      originalError
    );
  }
  
  /**
   * Create a validation error for a required field
   */
  static required(field: string, originalError?: unknown): ValidationError {
    return ValidationError.field(field, 'is required', undefined, originalError);
  }
  
  /**
   * Create a validation error for an invalid format
   */
  static format(field: string, value: any, originalError?: unknown): ValidationError {
    return ValidationError.field(field, 'has invalid format', value, originalError);
  }
  
  /**
   * Create a validation error for a value out of range
   */
  static range(field: string, value: any, min?: number, max?: number, originalError?: unknown): ValidationError {
    let message = 'is out of range';
    if (min !== undefined && max !== undefined) {
      message = `must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `must be at least ${min}`;
    } else if (max !== undefined) {
      message = `must be at most ${max}`;
    }
    
    return ValidationError.field(field, message, value, originalError);
  }
  
  /**
   * Create a validation error for an invalid length
   */
  static length(field: string, value: string, min?: number, max?: number, originalError?: unknown): ValidationError {
    let message = 'has invalid length';
    if (min !== undefined && max !== undefined) {
      message = `length must be between ${min} and ${max} characters`;
    } else if (min !== undefined) {
      message = `length must be at least ${min} characters`;
    } else if (max !== undefined) {
      message = `length must be at most ${max} characters`;
    }
    
    return ValidationError.field(field, message, value, originalError);
  }
  
  /**
   * Get a formatted message with all validation details
   */
  getFormattedMessage(): string {
    if (this.details.length === 0) {
      return this.message;
    }
    
    const detailsStr = this.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
    return `${this.message}:\n${detailsStr}`;
  }
  
  /**
   * Get a user-friendly message for display
   */
  getUserMessage(): string {
    if (this.details.length === 0) {
      return this.message;
    }
    
    if (this.details.length === 1) {
      const detail = this.details[0];
      return `${detail.field}: ${detail.message}`;
    }
    
    return `Please fix the following issues:\n${this.details.map(d => `- ${d.field}: ${d.message}`).join('\n')}`;
  }
}
