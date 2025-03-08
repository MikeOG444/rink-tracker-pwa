import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Specialized error class for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string, 
    severity: ErrorSeverity = ErrorSeverity.ERROR, 
    originalError?: unknown
  ) {
    super(message, ErrorCategory.DATABASE, severity, originalError);
    this.name = 'DatabaseError';
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
  
  /**
   * Create a database connection error
   */
  static connection(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database connection error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a database query error
   */
  static query(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database query error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a database transaction error
   */
  static transaction(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database transaction error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a database not found error
   */
  static notFound(entity: string, id: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`${entity} with ID ${id} not found`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a database validation error
   */
  static validation(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database validation error: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a database permission error
   */
  static permission(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database permission error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a database offline error
   */
  static offline(message: string, originalError?: unknown): DatabaseError {
    return new DatabaseError(`Database offline error: ${message}`, ErrorSeverity.WARNING, originalError);
  }
}
