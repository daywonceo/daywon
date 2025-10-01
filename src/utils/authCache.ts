import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Singleton pattern for auth request deduplication
 * Prevents multiple simultaneous auth checks
 */
class AuthCache {
  private static instance: AuthCache;
  private pendingRequest: Promise<{ data: { session: Session | null } }> | null = null;
  private lastSessionCheck = 0;
  private readonly MIN_CHECK_INTERVAL = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): AuthCache {
    if (!AuthCache.instance) {
      AuthCache.instance = new AuthCache();
    }
    return AuthCache.instance;
  }

  /**
   * Get session with request deduplication
   * If a request is already in flight, return that promise
   * If checked recently, skip the check
   */
  async getSession(): Promise<{ data: { session: Session | null } }> {
    const now = Date.now();
    
    // If a request is already pending, return it
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // If we checked very recently, skip
    if (now - this.lastSessionCheck < this.MIN_CHECK_INTERVAL) {
      return { data: { session: null } };
    }

    // Make the request and cache the promise
    this.pendingRequest = supabase.auth.getSession();
    this.lastSessionCheck = now;

    try {
      const result = await this.pendingRequest;
      return result;
    } finally {
      // Clear pending request after completion
      this.pendingRequest = null;
    }
  }

  /**
   * Clear cache - useful for logout or forced refresh
   */
  clear(): void {
    this.pendingRequest = null;
    this.lastSessionCheck = 0;
  }
}

export const authCache = AuthCache.getInstance();
