import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-destructive text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive font-mono">{error.message}</p>
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

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
          // Could integrate with Sentry, LogRocket, etc.
          console.error('App Error:', error, errorInfo);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};