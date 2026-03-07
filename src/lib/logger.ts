/**
 * Centralized Logging Utility
 * 
 * Replace console.log statements with this logger for:
 * - Structured logging
 * - Environment-aware logging (no logs in production)
 * - Easy integration with monitoring tools
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';
  
  private log(level: LogLevel, message: string, context?: LogContext) {
    // Suppress logs in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGS) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    
    // In production, you would send these to a logging service (e.g., Datadog, Sentry)
    // For now, we'll use console but with structured format
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(`[${timestamp}] DEBUG: ${message}${contextStr}`);
        }
        break;
      case 'info':
        console.info(`[${timestamp}] INFO: ${message}${contextStr}`);
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN: ${message}${contextStr}`);
        break;
      case 'error':
        console.error(`[${timestamp}] ERROR: ${message}${contextStr}`);
        break;
    }
  }
  
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }
  
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    };
    this.log('error', message, errorContext);
  }
}

export const logger = new Logger();
