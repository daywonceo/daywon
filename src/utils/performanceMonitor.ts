// Simple performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static counters = new Map<string, number>();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static increment(counterName: string): void {
    const current = this.counters.get(counterName) || 0;
    this.counters.set(counterName, current + 1);
  }

  static getCounter(counterName: string): number {
    return this.counters.get(counterName) || 0;
  }

  static resetCounter(counterName: string): void {
    this.counters.set(counterName, 0);
  }

  static logSummary(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Summary:');
      for (const [name, count] of this.counters.entries()) {
        console.log(`  ${name}: ${count}`);
      }
    }
  }

  static measureFunction<T>(label: string, fn: () => T): T {
    this.startTimer(label);
    try {
      return fn();
    } finally {
      this.endTimer(label);
    }
  }

  static async measureAsyncFunction<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      return await fn();
    } finally {
      this.endTimer(label);
    }
  }
}

// Add performance monitoring to streak calculations in development
export const withPerformanceMonitoring = <T extends any[], R>(
  label: string,
  fn: (...args: T) => R
) => {
  return (...args: T): R => {
    if (process.env.NODE_ENV === 'development') {
      PerformanceMonitor.increment(`${label}_calls`);
      return PerformanceMonitor.measureFunction(label, () => fn(...args));
    }
    return fn(...args);
  };
};