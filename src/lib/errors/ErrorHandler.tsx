/**
 * Unified Error Handling System
 * 
 * Usage Guidelines:
 * - AppErrorBoundary: Top-level app errors (wrap entire app)
 * - FeatureErrorBoundary: Feature-specific errors (wrap features/pages)
 * - useErrorHandler: Hook for handling errors in components/hooks
 * - ErrorLogger: Direct logging to external services
 */

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

// ============= Error Types =============

export type NetworkErrorType = 
  | 'network'
  | 'timeout'
  | 'server'
  | 'unauthorized'
  | 'notfound'
  | 'badrequest'
  | 'unknown';

interface NetworkError {
  type: NetworkErrorType;
  message: string;
  statusCode?: number;
  originalError?: Error;
}

// ============= Error Messages =============

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect. Please check your internet connection and try again.",
  TIMEOUT: "The request took too long. Please try again.",
  AUTH_EXPIRED: "Your session has expired. Please sign in again.",
  AUTH_INVALID: "Authentication failed. Please sign in again.",
  AUTH_REQUIRED: "Please sign in to access this feature.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  DATA_SAVE_FAILED: "Unable to save. Please try again.",
  DATA_LOAD_FAILED: "Unable to load data. Please refresh the page.",
} as const;

// ============= Error Parser =============

const parseNetworkError = (error: any): NetworkError => {
  if (!navigator.onLine || error.message?.includes('network')) {
    return {
      type: 'network',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      originalError: error
    };
  }

  if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
    return {
      type: 'timeout',
      message: ERROR_MESSAGES.TIMEOUT,
      originalError: error
    };
  }

  const status = error.status || error.statusCode || error.response?.status;
  
  if (status === 401 || status === 403) {
    return {
      type: 'unauthorized',
      message: ERROR_MESSAGES.AUTH_EXPIRED,
      statusCode: status,
      originalError: error
    };
  }

  if (status === 404) {
    return {
      type: 'notfound',
      message: 'The requested resource was not found.',
      statusCode: status,
      originalError: error
    };
  }

  if (status === 400) {
    return {
      type: 'badrequest',
      message: error.message || 'Invalid request. Please check your input.',
      statusCode: status,
      originalError: error
    };
  }

  if (status >= 500) {
    return {
      type: 'server',
      message: 'Server error. Please try again later.',
      statusCode: status,
      originalError: error
    };
  }

  return {
    type: 'unknown',
    message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
    originalError: error
  };
};

// ============= Error Hook =============

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = React.useCallback((error: any, customMessage?: string) => {
    const networkError = parseNetworkError(error);
    
    console.error('[Error Handler]', {
      type: networkError.type,
      message: networkError.message,
      statusCode: networkError.statusCode,
      originalError: networkError.originalError
    });

    toast({
      title: "Error",
      description: customMessage || networkError.message,
      variant: "destructive",
    });

    return networkError;
  }, [toast]);

  const handleSuccess = React.useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  }, [toast]);

  return {
    handleError,
    handleSuccess,
    parseNetworkError
  };
};

// ============= Error Boundaries =============

// Top-level app error boundary
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const AppErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-destructive text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive font-mono break-words">{error.message}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="default">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AppErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={AppErrorFallback}
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'production') {
          console.error('App Error:', error, errorInfo);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Feature-level error boundary
interface FeatureErrorFallbackProps extends ErrorFallbackProps {
  featureName: string;
}

const FeatureErrorFallback = ({ error, resetErrorBoundary, featureName }: FeatureErrorFallbackProps) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {featureName} Temporarily Unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              We encountered an issue loading this feature.
            </p>
            <p className="text-xs text-muted-foreground">
              Your data is safe. Please try again.
            </p>
          </div>
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FeatureErrorBoundary = ({ 
  children, 
  featureName,
  onError 
}: { 
  children: React.ReactNode; 
  featureName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${featureName} Error:`, error, errorInfo);
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <FeatureErrorFallback {...props} featureName={featureName} />
      )}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Lightweight error boundary for lazy-loaded components
const LazyErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
    <h3 className="text-destructive font-semibold">Something went wrong</h3>
    <p className="text-destructive/80 text-sm mt-1">{error.message}</p>
    <Button 
      onClick={resetErrorBoundary}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      Try again
    </Button>
  </div>
);

export const LazyErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary FallbackComponent={LazyErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
};

// ============= Async Error Wrapper =============

export const withErrorHandling = async <T,>(
  operation: () => Promise<T>,
  errorHandler: ReturnType<typeof useErrorHandler>['handleError'],
  customMessage?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    errorHandler(error, customMessage);
    return null;
  }
};
