import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Specialized error class for network-related errors
 */
export class NetworkError extends AppError {
  constructor(
    message: string, 
    severity: ErrorSeverity = ErrorSeverity.ERROR, 
    originalError?: unknown
  ) {
    super(message, ErrorCategory.NETWORK, severity, originalError);
    this.name = 'NetworkError';
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
  
  /**
   * Create a connection error
   */
  static connection(message: string, originalError?: unknown): NetworkError {
    return new NetworkError(`Connection error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a timeout error
   */
  static timeout(message: string, originalError?: unknown): NetworkError {
    return new NetworkError(`Network timeout: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create an offline error
   */
  static offline(message: string = 'No internet connection available', originalError?: unknown): NetworkError {
    return new NetworkError(`Offline: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a DNS error
   */
  static dns(message: string, originalError?: unknown): NetworkError {
    return new NetworkError(`DNS error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a CORS error
   */
  static cors(message: string, originalError?: unknown): NetworkError {
    return new NetworkError(`CORS error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a TLS/SSL error
   */
  static tls(message: string, originalError?: unknown): NetworkError {
    return new NetworkError(`TLS/SSL error: ${message}`, ErrorSeverity.ERROR, originalError);
  }
}
