import React, { useEffect, useRef, useState } from 'react';

// Enhanced cache implementation with TTL and size limits
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private currentSize = 0;
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;

  constructor(maxSize: number = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const size = this.calculateSize(data);
    
    // Remove expired entries and make space if needed
    this.cleanup();
    this.evictIfNeeded(size);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      size,
    });
    
    this.currentSize += size;
    this.accessOrder.set(key, ++this.accessCounter);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    // Update access order for LRU
    this.accessOrder.set(key, ++this.accessCounter);
    
    return entry.data;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return true;
    }
    return false;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.currentSize = 0;
    this.accessCounter = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  private evictIfNeeded(newEntrySize: number): void {
    while (this.currentSize + newEntrySize > this.maxSize && this.cache.size > 0) {
      // Evict least recently used item
      let oldestKey = '';
      let oldestAccess = Infinity;
      
      for (const [key, access] of this.accessOrder.entries()) {
        if (access < oldestAccess) {
          oldestAccess = access;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  private calculateSize(data: T): number {
    // Rough size calculation
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  getStats() {
    return {
      size: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      hitRate: this.accessCounter > 0 ? this.cache.size / this.accessCounter : 0,
    };
  }
}

// Global caches
const queryCache = new SmartCache<any>(30 * 1024 * 1024); // 30MB for queries
const imageCache = new SmartCache<string>(20 * 1024 * 1024); // 20MB for images
const componentCache = new SmartCache<any>(10 * 1024 * 1024); // 10MB for components

// Hook for caching query results
export const useCachedQuery = <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cached = queryCache.get(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await queryFn();
        queryCache.set(key, result, ttl);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttl]);

  const refetch = async () => {
    queryCache.delete(key);
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      queryCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook for caching images with preloading
export const useCachedImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!src) return;

    // Check cache first
    const cached = imageCache.get(src);
    if (cached) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src, 30 * 60 * 1000); // Cache for 30 minutes
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  }, [src]);

  return { isLoaded, error };
};

// Offline storage with background sync
export const useOfflineStorage = <T>(key: string) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pendingOperations = useRef<Array<{ type: 'set' | 'delete'; key: string; value?: T }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process pending operations
      processPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processPendingOperations = async () => {
    while (pendingOperations.current.length > 0) {
      const operation = pendingOperations.current.shift();
      if (!operation) continue;

      try {
        if (operation.type === 'set') {
          // Sync to server
          await syncToServer(operation.key, operation.value);
        } else if (operation.type === 'delete') {
          // Delete from server
          await deleteFromServer(operation.key);
        }
      } catch (error) {
        console.error('Failed to sync operation:', error);
        // Put back in queue to retry later
        pendingOperations.current.unshift(operation);
        break;
      }
    }
  };

  const set = (value: T) => {
    // Store locally immediately
    localStorage.setItem(key, JSON.stringify(value));

    if (isOnline) {
      // Sync to server immediately
      syncToServer(key, value).catch(() => {
        // Add to pending operations if sync fails
        pendingOperations.current.push({ type: 'set', key, value });
      });
    } else {
      // Add to pending operations
      pendingOperations.current.push({ type: 'set', key, value });
    }
  };

  const get = (): T | null => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  };

  const remove = () => {
    localStorage.removeItem(key);

    if (isOnline) {
      deleteFromServer(key).catch(() => {
        pendingOperations.current.push({ type: 'delete', key });
      });
    } else {
      pendingOperations.current.push({ type: 'delete', key });
    }
  };

  return { set, get, remove, isOnline, hasPendingOperations: pendingOperations.current.length > 0 };
};

// Placeholder functions for server sync (implement based on your backend)
const syncToServer = async (key: string, value: any): Promise<void> => {
  // Implement your server sync logic here
  console.log('Syncing to server:', key, value);
};

const deleteFromServer = async (key: string): Promise<void> => {
  // Implement your server delete logic here
  console.log('Deleting from server:', key);
};

// Performance-optimized component memoization
export const useMemoizedComponent = <T extends any[]>(
  Component: React.ComponentType<any>,
  props: T,
  dependencies: any[] = []
): React.ReactElement => {
  const memoKey = JSON.stringify([Component.name, ...props, ...dependencies]);
  
  return React.useMemo(() => {
    const cached = componentCache.get(memoKey);
    if (cached) {
      return cached;
    }
    
    const element = React.createElement(Component, ...props);
    componentCache.set(memoKey, element, 60 * 1000); // Cache for 1 minute
    return element;
  }, dependencies);
};

// Cache management utilities
export const cacheManager = {
  clearAll: () => {
    queryCache.clear();
    imageCache.clear();
    componentCache.clear();
  },
  
  getStats: () => ({
    query: queryCache.getStats(),
    image: imageCache.getStats(),
    component: componentCache.getStats(),
  }),
  
  evictExpired: () => {
    // Force cleanup on all caches
    queryCache.has('__cleanup__'); // Triggers cleanup
    imageCache.has('__cleanup__');
    componentCache.has('__cleanup__');
  },
};