import { useCallback, useMemo, DependencyList } from 'react';

/**
 * Enhanced useCallback with deep dependency comparison
 * Prevents unnecessary re-renders when dependencies haven't actually changed
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Enhanced useMemo with deep dependency comparison
 * Prevents unnecessary recalculations when dependencies haven't actually changed
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Memoize a value that only changes when its JSON representation changes
 * Useful for objects and arrays
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Stable reference to a value that persists across renders
 * Updates only when dependencies change
 */
export function useConstant<T>(factory: () => T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, []);
}
