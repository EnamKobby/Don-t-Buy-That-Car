/**
 * Centralized Logger for the application.
 * Ensures all errors are logged with context and no silent failures occur.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context ? { context } : {}),
      ...(error ? { error: error instanceof Error ? error.message : String(error) } : {}),
      ...((error instanceof Error && error.stack) ? { stack: error.stack } : {})
    };

    // In a real production app, this would send to Datadog/Sentry/etc.
    if (level === 'error') {
      console.error(JSON.stringify(logEntry, null, 2));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry, null, 2));
    } else {
      console.info(JSON.stringify(logEntry, null, 2));
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    this.log('warn', message, context, error);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
