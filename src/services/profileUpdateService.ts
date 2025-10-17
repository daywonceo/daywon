import { supabase } from '@/integrations/supabase/client';

interface ProfileUpdate {
  status?: 'online' | 'away' | 'offline';
  last_active?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  username?: string;
}

interface QueuedUpdate {
  userId: string;
  updates: ProfileUpdate;
  timestamp: number;
}

class ProfileUpdateService {
  private updateQueue: Map<string, QueuedUpdate> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 2000; // 2 seconds
  private readonly BATCH_SIZE = 10;
  private isProcessing = false;
  private lastStatusUpdate: Map<string, { status: string; timestamp: number }> = new Map();
  private readonly STATUS_UPDATE_THROTTLE = 5000; // 5 seconds minimum between status updates

  /**
   * Queue a profile update with debouncing
   */
  queueUpdate(userId: string, updates: ProfileUpdate): void {
    // Check if this is a duplicate status update that should be throttled
    if (updates.status && this.shouldThrottleStatusUpdate(userId, updates.status)) {
      console.log(`Throttling duplicate status update for user ${userId}`);
      return;
    }

    const existing = this.updateQueue.get(userId);
    const mergedUpdates = existing 
      ? { ...existing.updates, ...updates }
      : updates;

    this.updateQueue.set(userId, {
      userId,
      updates: mergedUpdates,
      timestamp: Date.now(),
    });

    // Update throttle tracking for status changes
    if (updates.status) {
      this.lastStatusUpdate.set(userId, {
        status: updates.status,
        timestamp: Date.now(),
      });
    }

    this.scheduleFlush();
  }

  /**
   * Check if a status update should be throttled
   */
  private shouldThrottleStatusUpdate(userId: string, newStatus: string): boolean {
    const lastUpdate = this.lastStatusUpdate.get(userId);
    if (!lastUpdate) return false;

    const timeSinceLastUpdate = Date.now() - lastUpdate.timestamp;
    const isSameStatus = lastUpdate.status === newStatus;
    
    return isSameStatus && timeSinceLastUpdate < this.STATUS_UPDATE_THROTTLE;
  }

  /**
   * Schedule a flush of the update queue
   */
  private scheduleFlush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Immediately flush all pending updates
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.updateQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const updates = Array.from(this.updateQueue.values());
      this.updateQueue.clear();

      // Process updates in batches
      for (let i = 0; i < updates.length; i += this.BATCH_SIZE) {
        const batch = updates.slice(i, i + this.BATCH_SIZE);
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error('Error flushing profile updates:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a batch of updates
   */
  private async processBatch(batch: QueuedUpdate[]): Promise<void> {
    const promises = batch.map(async ({ userId, updates }) => {
      try {
        // Automatically add last_active timestamp
        const updateData = {
          ...updates,
          last_active: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error(`Failed to update profile for user ${userId}:`, error);
        }
      } catch (error) {
        console.error(`Error updating profile for user ${userId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Update status with throttling
   */
  updateStatus(userId: string, status: 'online' | 'away' | 'offline'): void {
    this.queueUpdate(userId, { status });
  }

  /**
   * Update last_active timestamp
   */
  updateLastActive(userId: string): void {
    this.queueUpdate(userId, { last_active: new Date().toISOString() });
  }

  /**
   * Batch update multiple fields
   */
  updateProfile(userId: string, updates: ProfileUpdate): void {
    this.queueUpdate(userId, updates);
  }

  /**
   * Flush updates before page unload
   */
  async flushBeforeUnload(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await this.flush();
  }

  /**
   * Clean up old throttle entries (call periodically)
   */
  cleanupThrottleCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.lastStatusUpdate.forEach((value, key) => {
      if (now - value.timestamp > this.STATUS_UPDATE_THROTTLE * 2) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach(key => this.lastStatusUpdate.delete(key));
  }
}

// Singleton instance
export const profileUpdateService = new ProfileUpdateService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    profileUpdateService.flushBeforeUnload();
  });

  // Periodic cleanup of throttle cache (every 30 seconds)
  setInterval(() => {
    profileUpdateService.cleanupThrottleCache();
  }, 30000);
}
