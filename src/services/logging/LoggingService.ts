import { AppError, ErrorSeverity } from '../error';

/**
 * Log levels for the logging service
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * Interface for a log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

/**
 * Service for structured logging with different log levels
 */
export class LoggingService {
  private static instance: LoggingService;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 100;
  private monitoringEnabled: boolean = false;
  
  /**
   * Get the singleton instance of the logging service
   */
  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'test') {
      this.logLevel = LogLevel.WARNING;
    } else {
      this.logLevel = LogLevel.INFO;
    }
    
    // Check if monitoring is enabled
    this.monitoringEnabled = process.env.NODE_ENV === 'production';
  }
  
  /**
   * Set the log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  /**
   * Enable or disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
  }
  
  /**
   * Set the maximum number of logs to keep in memory
   */
  setMaxLogSize(size: number): void {
    this.maxLogSize = size;
  }
  
  /**
   * Log a message with the specified level
   */
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
      
      // Trim logs if they exceed max size
      if (this.logs.length > this.maxLogSize) {
        this.logs = this.logs.slice(-this.maxLogSize);
      }
      
      // Output to console with appropriate styling
      this.outputToConsole(entry);
      
      // Send to monitoring service if enabled and level is high enough
      if (this.monitoringEnabled && level >= LogLevel.ERROR) {
        this.sendToMonitoringService(entry);
      }
    }
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }
  
  /**
   * Log an info message
   */
  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }
  
  /**
   * Log a warning message
   */
  warning(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARNING, message, context, data);
  }
  
  /**
   * Log an error message
   */
  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }
  
  /**
   * Log a critical error message
   */
  critical(message: string, context?: string, data?: any): void {
    this.log(LogLevel.CRITICAL, message, context, data);
  }
  
  /**
   * Log an AppError
   */
  logAppError(error: AppError, context?: string): void {
    const level = this.mapSeverityToLogLevel(error.severity);
    this.log(
      level,
      error.message,
      context || error.name,
      {
        name: error.name,
        category: error.category,
        timestamp: error.timestamp,
        originalError: error.originalError
      }
    );
  }
  
  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * Get logs filtered by context
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }
  
  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Map error severity to log level
   */
  private mapSeverityToLogLevel(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.INFO:
        return LogLevel.INFO;
      case ErrorSeverity.WARNING:
        return LogLevel.WARNING;
      case ErrorSeverity.ERROR:
        return LogLevel.ERROR;
      case ErrorSeverity.CRITICAL:
        return LogLevel.CRITICAL;
      default:
        return LogLevel.ERROR;
    }
  }
  
  /**
   * Output a log entry to the console with appropriate styling
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    let logFn: (...args: any[]) => void;
    let style: string;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        logFn = console.debug;
        style = 'color: gray';
        break;
      case LogLevel.INFO:
        logFn = console.info;
        style = 'color: blue';
        break;
      case LogLevel.WARNING:
        logFn = console.warn;
        style = 'color: orange';
        break;
      case LogLevel.ERROR:
        logFn = console.error;
        style = 'color: red';
        break;
      case LogLevel.CRITICAL:
        logFn = console.error;
        style = 'color: red; font-weight: bold';
        break;
      default:
        logFn = console.log;
        style = '';
    }
    
    const levelName = LogLevel[entry.level];
    
    // Log with styling
    logFn(`%c${timestamp} [${levelName}] ${context} ${entry.message}`, style);
    
    // Log data if present
    if (entry.data) {
      logFn(entry.data);
    }
  }
  
  /**
   * Send a log entry to a monitoring service
   * This is a placeholder for integration with a real monitoring service
   */
  private sendToMonitoringService(entry: LogEntry): void {
    // In a real implementation, this would send the log to a service like Sentry, LogRocket, etc.
    // For now, we'll just log to console that we would have sent it
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Monitoring] Would send to monitoring service: ${JSON.stringify(entry)}`);
    }
    
    // Example implementation for a real monitoring service:
    // 
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   const { level, message, context, data } = entry;
    //   window.Sentry.captureMessage(message, {
    //     level: this.mapLogLevelToSentryLevel(level),
    //     tags: { context },
    //     extra: data
    //   });
    // }
  }
  
  /**
   * Map log level to a monitoring service level (example for Sentry)
   * @unused This method is prepared for future integration with monitoring services
   */
  // @ts-ignore: Prepared for future use with monitoring services
  private mapLogLevelToSentryLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARNING:
        return 'warning';
      case LogLevel.ERROR:
        return 'error';
      case LogLevel.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }
}

// Create and export a default instance
export const logger = LoggingService.getInstance();
