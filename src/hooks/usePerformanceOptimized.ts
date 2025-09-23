import { useCallback, useRef, useMemo } from 'react';

/**
 * Performance optimization hooks for reducing unnecessary operations
 */

/**
 * Debounce hook to prevent excessive function calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

/**
 * Throttle hook to limit function calls to once per interval
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  interval: number
) => {
  const lastCallRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= interval) {
      lastCallRef.current = now;
      return callback(...args);
    }
  }, [callback, interval]) as T;
};

/**
 * Memoized network request cache
 */
export const useRequestCache = () => {
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  
  const getCachedRequest = useCallback((key: string, maxAge: number = 30000) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }, []);
  
  const setCachedRequest = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);
  
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);
  
  return { getCachedRequest, setCachedRequest, clearCache };
};

/**
 * Optimized dependency array that only updates when values actually change
 */
export const useStableDeps = <T extends readonly unknown[]>(deps: T): T => {
  const stableDepsRef = useRef<T>(deps);
  
  return useMemo(() => {
    // Check if any dependency has actually changed
    const hasChanged = deps.some((dep, index) => {
      const prev = stableDepsRef.current[index];
      return prev !== dep;
    });
    
    if (hasChanged) {
      stableDepsRef.current = deps;
    }
    
    return stableDepsRef.current;
  }, deps);
};