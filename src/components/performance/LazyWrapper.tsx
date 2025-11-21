import React, { Suspense, memo } from 'react';
import { LazyErrorBoundary } from '@/lib/errors/ErrorHandler';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

/**
 * Performance-optimized wrapper for lazy-loaded components
 * Includes error boundaries and loading states using design system
 */
export const LazyWrapper = memo<LazyWrapperProps>(({ 
  children, 
  fallback = <DefaultFallback />
}) => {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
});

LazyWrapper.displayName = 'LazyWrapper';