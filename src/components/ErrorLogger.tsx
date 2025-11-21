/**
 * @deprecated ErrorLogger has been consolidated into the unified error handling system
 * Use AppErrorBoundary and useErrorHandler from '@/lib/errors/ErrorHandler' instead
 * 
 * This file is kept for backward compatibility only
 */

import { useEffect } from 'react';

// Stub for backward compatibility
class ErrorLogger {
  private static instance: ErrorLogger;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, errorInfo?: React.ErrorInfo, context?: any) {
    console.error('[Deprecated ErrorLogger]', error, errorInfo, context);
    console.warn('ErrorLogger is deprecated. Use AppErrorBoundary or useErrorHandler instead.');
  }

  getErrors(): any[] {
    return [];
  }

  clearErrors(): void {
    // No-op
  }
}

// Global error handler is now handled by AppErrorBoundary
export const GlobalErrorHandler = () => {
  useEffect(() => {
    console.warn('GlobalErrorHandler is deprecated. Error handling is now managed by AppErrorBoundary.');
  }, []);

  return null;
};

export const errorLogger = ErrorLogger.getInstance();