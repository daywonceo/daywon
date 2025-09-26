import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorInfo {
  error: Error;
  errorInfo: React.ErrorInfo;
  userId?: string;
  route?: string;
  timestamp: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: ErrorInfo[] = [];

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, errorInfo?: React.ErrorInfo, context?: any) {
    const errorLog: ErrorInfo = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo: errorInfo || { componentStack: '' },
      userId: context?.userId,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    // Store locally
    this.errors.push(errorLog);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // In production, you could send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorLog);
    }

    // Show user-friendly toast
    this.showUserToast(error);
  }

  private showUserToast(error: Error) {
    // Don't spam users with too many error toasts
    const recentErrors = this.errors.filter(
      e => Date.now() - new Date(e.timestamp).getTime() < 5000
    );
    
    if (recentErrors.length <= 3) {
      toast({
        title: "Something went wrong",
        description: "We've logged the issue and are looking into it.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  private async sendToExternalService(errorLog: ErrorInfo) {
    try {
      // Implement your error reporting service here
      // e.g., Sentry, LogRocket, etc.
      console.log('Would send to external service:', errorLog);
    } catch (e) {
      console.error('Failed to send error to external service:', e);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Global error handler component
export const GlobalErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      ErrorLogger.getInstance().logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`)
      );
    };

    const handleError = (event: ErrorEvent) => {
      ErrorLogger.getInstance().logError(
        new Error(`Global Error: ${event.message}`)
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
};

export const errorLogger = ErrorLogger.getInstance();