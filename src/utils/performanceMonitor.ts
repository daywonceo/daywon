import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface CustomMetrics {
  componentMountTime: number;
  route: string;
  userAgent: string;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: (PerformanceMetrics & CustomMetrics)[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  initialize() {
    if (typeof window === 'undefined') return;

    // Web Vitals observers
    this.observeWebVitals();
    
    // Custom performance tracking
    this.trackPageLoad();
    
    // Memory usage monitoring
    this.monitorMemoryUsage();
  }

  private observeWebVitals() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric({ lcp: lastEntry.startTime });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric({ fid: entry.processingStart - entry.startTime });
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric({ cls: clsValue });
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private trackPageLoad() {
    window.addEventListener('load', () => {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric({
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: this.getFCP(),
        });
      }
    });
  }

  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private monitorMemoryUsage() {
    // Monitor memory every 30 seconds
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    }, 30000);
  }

  recordMetric(metric: Partial<PerformanceMetrics>) {
    const fullMetric = {
      ...metric,
      componentMountTime: performance.now(),
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };
    
    this.metrics.push(fullMetric);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric:', fullMetric);
    }
    
    // In production, you could send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(fullMetric);
    }
  }

  private async sendToAnalytics(metric: any) {
    try {
      // Implement your analytics service here
      // e.g., Google Analytics, PostHog, etc.
      console.log('Would send to analytics:', metric);
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startTime = useRef<number>(performance.now());
  
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    // Record component mount time
    const mountTime = performance.now() - startTime.current;
    monitor.recordMetric({ fcp: mountTime });
    
    return () => {
      // Record component unmount time
      const unmountTime = performance.now() - startTime.current;
      console.log(`Component lifecycle: ${unmountTime.toFixed(2)}ms`);
    };
  }, []);
};

// Hook for measuring specific operations
export const usePerformanceMeasure = (name: string) => {
  const measure = {
    start: () => performance.mark(`${name}-start`),
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measurement = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measurement.duration.toFixed(2)}ms`);
      
      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return measurement.duration;
    }
  };
  
  return measure;
};

export const performanceMonitor = PerformanceMonitor.getInstance();