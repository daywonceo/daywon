import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to optimize React Query behavior across the app
 */
export const useQueryOptimizer = () => {
  const queryClient = useQueryClient();
  const hasSetup = useRef(false);
  
  useEffect(() => {
    if (hasSetup.current) return;
    hasSetup.current = true;
    
    // Set global defaults for better caching
    queryClient.setDefaultOptions({
      queries: {
        // Reduce refetching
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Cache optimization
        staleTime: 1000 * 60 * 2, // 2 minutes default
        gcTime: 1000 * 60 * 10, // 10 minutes default
        
        // Retry configuration
        retry: 1,
        retryDelay: 1000,
      },
    });
  }, [queryClient]);
  
  /**
   * Invalidate related queries efficiently
   */
  const invalidateHabitQueries = async () => {
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && (
          key.includes('habit') ||
          key.includes('topHabits') ||
          key === 'activeHabits' ||
          key === 'allHabits'
        );
      },
    });
  };
  
  /**
   * Batch invalidate multiple query keys
   */
  const batchInvalidate = async (queryKeys: string[]) => {
    await Promise.all(
      queryKeys.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
    );
  };
  
  /**
   * Clear stale data from cache
   */
  const clearStaleData = () => {
    queryClient.clear();
  };
  
  /**
   * Prefetch data for improved UX
   */
  const prefetchQuery = async (
    queryKey: any[],
    queryFn: () => Promise<any>,
    options?: { staleTime?: number }
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime,
    });
  };
  
  return {
    invalidateHabitQueries,
    batchInvalidate,
    clearStaleData,
    prefetchQuery,
  };
};

/**
 * Hook to deduplicate API calls within a time window
 */
export const useDeduplicatedFetch = <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  windowMs: number = 100
) => {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  
  const fetch = async (): Promise<T> => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);
    
    // Return cached data if within time window
    if (cached && now - cached.timestamp < windowMs) {
      return cached.data;
    }
    
    // Fetch new data
    const data = await fetchFn();
    cacheRef.current.set(key, { data, timestamp: now });
    
    // Clean up old cache entries
    if (cacheRef.current.size > 50) {
      const oldestKey = Array.from(cacheRef.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      cacheRef.current.delete(oldestKey);
    }
    
    return data;
  };
  
  return { fetch };
};
