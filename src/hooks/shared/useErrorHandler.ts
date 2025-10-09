import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

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

export const useErrorHandler = () => {
  const { toast } = useToast();

  const parseNetworkError = useCallback((error: any): NetworkError => {
    // Network connectivity issues
    if (!navigator.onLine || error.message?.includes('network')) {
      return {
        type: 'network',
        message: 'No internet connection. Please check your network and try again.',
        originalError: error
      };
    }

    // Timeout errors
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        originalError: error
      };
    }

    // HTTP status codes
    const status = error.status || error.statusCode || error.response?.status;
    
    if (status === 401 || status === 403) {
      return {
        type: 'unauthorized',
        message: 'You need to be logged in to perform this action.',
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

    // Generic error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      originalError: error
    };
  }, []);

  const handleError = useCallback((error: any, customMessage?: string) => {
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
  }, [parseNetworkError, toast]);

  const handleSuccess = useCallback((message: string, description?: string) => {
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

// Async operation wrapper with error handling
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
