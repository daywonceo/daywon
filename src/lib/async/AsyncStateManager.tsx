/**
 * Unified Async State Management System
 * 
 * Usage Guidelines:
 * - Spinner: Simple loading indicator
 * - LoadingSpinner: Centered spinner with optional message
 * - PageLoader: Full-page loading state
 * - CardSkeleton: Skeleton loaders for cards
 * - ListSkeleton: Skeleton loaders for lists
 * - AsyncState: Handle loading/error/success states
 * - DataState: Handle data fetching with empty state
 * - EmptyState: Display when no data is available
 */

import React, { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

// ============= Loading Components =============

export const Spinner = ({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingSpinner = ({ 
  message, 
  size = "md" 
}: { 
  message?: string; 
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Spinner size={size} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export const PageLoader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export const ListSkeleton = ({ 
  count = 3, 
  itemHeight = "h-16" 
}: { 
  count?: number; 
  itemHeight?: string;
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${itemHeight} w-full`} />
      ))}
    </div>
  );
};

export const ButtonLoader = ({ 
  loading, 
  children 
}: { 
  loading: boolean; 
  children: ReactNode;
}) => {
  if (loading) {
    return (
      <>
        <Spinner size="sm" className="mr-2" />
        {children}
      </>
    );
  }
  return <>{children}</>;
};

// ============= Error Components =============

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay = ({ message, onRetry, title = "Error" }: ErrorDisplayProps) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const InlineError = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg border border-destructive/20">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// ============= Empty State =============

export const EmptyState = ({ 
  message, 
  icon,
  action 
}: { 
  message: string; 
  icon?: ReactNode;
  action?: ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-muted-foreground">{message}</p>
      {action && action}
    </div>
  );
};

// ============= Unified Async State Components =============

interface AsyncStateProps {
  isLoading: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  errorTitle?: string;
  children: ReactNode;
}

/**
 * Unified component for handling async states (loading, error, success)
 * 
 * @example
 * <AsyncState isLoading={loading} error={error} onRetry={refetch}>
 *   <YourContent />
 * </AsyncState>
 */
export const AsyncState = ({
  isLoading,
  error,
  onRetry,
  loadingComponent,
  errorTitle,
  children
}: AsyncStateProps) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <ErrorDisplay
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <>{loadingComponent || <CardSkeleton count={3} />}</>;
  }

  return <>{children}</>;
};

interface DataStateProps<T> {
  isLoading: boolean;
  error?: Error | string | null;
  data: T[] | null | undefined;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  errorTitle?: string;
  children: (data: T[]) => ReactNode;
}

/**
 * Unified component for handling data fetching states with empty state support
 * 
 * @example
 * <DataState 
 *   isLoading={loading} 
 *   error={error} 
 *   data={items}
 *   onRetry={refetch}
 *   emptyComponent={<EmptyState message="No items found" />}
 * >
 *   {(items) => items.map(item => <Item key={item.id} {...item} />)}
 * </DataState>
 */
export const DataState = <T,>({
  isLoading,
  error,
  data,
  onRetry,
  loadingComponent,
  emptyComponent,
  errorTitle,
  children
}: DataStateProps<T>) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <ErrorDisplay
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <>{loadingComponent || <CardSkeleton count={3} />}</>;
  }

  if (!data || data.length === 0) {
    return <>{emptyComponent || <EmptyState message="No data available" />}</>;
  }

  return <>{children(data)}</>;
};

// ============= Simple Loading State Wrapper =============

export const LoadingState = ({ 
  isLoading, 
  loader, 
  children 
}: { 
  isLoading: boolean; 
  loader?: ReactNode; 
  children: ReactNode;
}) => {
  if (isLoading) {
    return <>{loader || <LoadingSpinner />}</>;
  }
  return <>{children}</>;
};
