import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-semibold">Something went wrong</h3>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

const DefaultFallback = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

/**
 * Performance-optimized wrapper for lazy-loaded components
 * Includes error boundaries and loading states
 */
export const LazyWrapper = memo<LazyWrapperProps>(({ 
  children, 
  fallback = <DefaultFallback />,
  errorFallback = DefaultErrorFallback 
}) => {
  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

LazyWrapper.displayName = 'LazyWrapper';