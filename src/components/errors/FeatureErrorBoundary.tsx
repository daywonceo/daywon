import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FeatureErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  featureName: string;
}

const FeatureErrorFallback = ({ error, resetErrorBoundary, featureName }: FeatureErrorFallbackProps) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg mb-2">
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

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const FeatureErrorBoundary = ({ 
  children, 
  featureName,
  onError 
}: FeatureErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${featureName} Error:`, error, errorInfo);
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <FeatureErrorFallback {...props} featureName={featureName} />
      )}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
};
