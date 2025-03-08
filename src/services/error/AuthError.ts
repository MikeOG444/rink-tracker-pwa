import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Specialized error class for authentication-related errors
 */
export class AuthError extends AppError {
  constructor(
    message: string, 
    severity: ErrorSeverity = ErrorSeverity.ERROR, 
    originalError?: unknown
  ) {
    super(message, ErrorCategory.AUTHENTICATION, severity, originalError);
    this.name = 'AuthError';
    
    // This is needed to make instanceof work correctly with extended Error classes
    Object.setPrototypeOf(this, AuthError.prototype);
  }
  
  /**
   * Create an invalid credentials error
   */
  static invalidCredentials(message: string = 'Invalid email or password', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a user not found error
   */
  static userNotFound(message: string = 'User not found', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an email already in use error
   */
  static emailInUse(message: string = 'Email already in use', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a weak password error
   */
  static weakPassword(message: string = 'Password is too weak', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create an account disabled error
   */
  static accountDisabled(message: string = 'Account has been disabled', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create a session expired error
   */
  static sessionExpired(message: string = 'Session has expired, please log in again', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create an email not verified error
   */
  static emailNotVerified(message: string = 'Email not verified', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a too many attempts error
   */
  static tooManyAttempts(message: string = 'Too many failed login attempts, please try again later', originalError?: unknown): AuthError {
    return new AuthError(`Authentication failed: ${message}`, ErrorSeverity.WARNING, originalError);
  }
  
  /**
   * Create a not authenticated error
   */
  static notAuthenticated(message: string = 'User is not authenticated', originalError?: unknown): AuthError {
    return new AuthError(`Authentication required: ${message}`, ErrorSeverity.ERROR, originalError);
  }
  
  /**
   * Create an error from Firebase auth error code
   */
  static fromFirebaseError(errorCode: string, originalError?: unknown): AuthError {
    let message = 'Authentication failed';
    let severity = ErrorSeverity.ERROR;
    
    switch (errorCode) {
      case 'auth/invalid-email':
        message = 'Invalid email address format';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already in use by another account';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        severity = ErrorSeverity.WARNING;
        break;
      case 'auth/operation-not-allowed':
        message = 'This operation is not allowed';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'An account already exists with the same email but different sign-in credentials';
        break;
      case 'auth/requires-recent-login':
        message = 'This operation requires a more recent login. Please log in again';
        severity = ErrorSeverity.WARNING;
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed login attempts. Please try again later';
        severity = ErrorSeverity.WARNING;
        break;
      default:
        message = `Authentication error: ${errorCode}`;
    }
    
    return new AuthError(message, severity, originalError);
  }
}
