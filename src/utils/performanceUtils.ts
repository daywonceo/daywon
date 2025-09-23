/**
 * Performance utilities for optimizing app performance
 */

// Request deduplication to prevent duplicate network calls
const activeRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5000
): Promise<T> => {
  // Check if request is already in progress
  if (activeRequests.has(key)) {
    return activeRequests.get(key) as Promise<T>;
  }

  // Start new request
  const request = requestFn();
  activeRequests.set(key, request);

  // Clean up after completion or timeout
  const cleanup = () => activeRequests.delete(key);
  
  setTimeout(cleanup, ttl);
  
  try {
    const result = await request;
    cleanup();
    return result;
  } catch (error) {
    cleanup();
    throw error;
  }
};

// Batch multiple operations to reduce re-renders
export class BatchProcessor<T> {
  private batch: T[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private processFn: (items: T[]) => void;
  private delay: number;

  constructor(processFn: (items: T[]) => void, delay: number = 100) {
    this.processFn = processFn;
    this.delay = delay;
  }

  add(item: T) {
    this.batch.push(item);
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.batch.length > 0) {
        this.processFn([...this.batch]);
        this.batch = [];
      }
      this.timeoutId = null;
    }, this.delay);
  }

  flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.batch.length > 0) {
      this.processFn([...this.batch]);
      this.batch = [];
    }
  }
}

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Memory cleanup utilities
export const cleanupLocalStorage = (prefix: string, maxAge: number) => {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.timestamp && now - data.timestamp > maxAge) {
          keysToRemove.push(key);
        }
      } catch {
        // Invalid JSON, remove it
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Optimized event listener management
export class OptimizedEventManager {
  private listeners = new Map<string, Set<() => void>>();
  private throttledEmitters = new Map<string, NodeJS.Timeout>();

  subscribe(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  emit(event: string, throttleMs: number = 0) {
    if (throttleMs > 0) {
      if (this.throttledEmitters.has(event)) {
        return;
      }

      this.throttledEmitters.set(event, setTimeout(() => {
        this.throttledEmitters.delete(event);
        this.executeEmit(event);
      }, throttleMs));
    } else {
      this.executeEmit(event);
    }
  }

  private executeEmit(event: string) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  clear() {
    this.listeners.clear();
    this.throttledEmitters.forEach(timeout => clearTimeout(timeout));
    this.throttledEmitters.clear();
  }
}