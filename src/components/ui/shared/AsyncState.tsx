import { ReactNode } from "react";
import { LoadingState, CardSkeleton } from "@/components/ui/shared/LoadingStates";
import { ErrorCard, ErrorType } from "@/components/ui/shared/ErrorStates";

interface AsyncStateProps {
  isLoading: boolean;
  error?: Error | string | null;
  errorType?: ErrorType;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
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
  errorType = 'generic',
  onRetry,
  loadingComponent,
  children
}: AsyncStateProps) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <ErrorCard
        type={errorType}
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
  errorType?: ErrorType;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
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
 *   emptyComponent={<EmptyState />}
 * >
 *   {(items) => items.map(item => <Item key={item.id} {...item} />)}
 * </DataState>
 */
export const DataState = <T,>({
  isLoading,
  error,
  data,
  errorType = 'generic',
  onRetry,
  loadingComponent,
  emptyComponent,
  children
}: DataStateProps<T>) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <ErrorCard
        type={errorType}
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <>{loadingComponent || <CardSkeleton count={3} />}</>;
  }

  if (!data || data.length === 0) {
    return <>{emptyComponent || <p className="text-center text-muted-foreground p-8">No data available</p>}</>;
  }

  return <>{children(data)}</>;
};
