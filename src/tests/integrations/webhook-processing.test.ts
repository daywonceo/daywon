import { describe, it, expect, vi } from 'vitest';

describe('Webhook Event Processing', () => {
  describe('Ignore Before Logic', () => {
    it('should ignore Todoist events older than ignore_before + 90s', async () => {
      const ignoreBefore = new Date('2024-01-01T12:00:00Z');
      const eventCompletedAt = new Date('2024-01-01T11:58:00Z'); // 2 minutes before ignore_before
      
      // Mock webhook payload
      const payload = {
        event_name: 'item:completed',
        event_data: {
          id: 'task-123',
          content: 'Read 10 pages',
          completed_at: eventCompletedAt.toISOString(),
        },
        user_id: 'todoist-user-456',
      };

      // Calculate if event should be ignored
      const completedWithBuffer = new Date(eventCompletedAt.getTime() + 90000); // +90s
      const shouldIgnore = completedWithBuffer < ignoreBefore;

      expect(shouldIgnore).toBe(true);
    });

    it('should process Todoist events completed within 90s of ignore_before', async () => {
      const ignoreBefore = new Date('2024-01-01T12:00:00Z');
      const eventCompletedAt = new Date('2024-01-01T11:59:00Z'); // 1 minute before, within 90s buffer
      
      const payload = {
        event_name: 'item:completed',
        event_data: {
          id: 'task-124',
          content: 'Exercise',
          completed_at: eventCompletedAt.toISOString(),
        },
        user_id: 'todoist-user-456',
      };

      const completedWithBuffer = new Date(eventCompletedAt.getTime() + 90000);
      const shouldIgnore = completedWithBuffer < ignoreBefore;

      expect(shouldIgnore).toBe(false);
    });

    it('should ignore Strava activities older than ignore_before + 90s', async () => {
      const ignoreBefore = new Date('2024-01-01T12:00:00Z');
      const activityStart = new Date('2024-01-01T11:00:00Z'); // 1 hour before
      
      const payload = {
        object_type: 'activity',
        object_id: 12345,
        aspect_type: 'create',
        owner_id: 67890,
        event_time: Math.floor(Date.now() / 1000),
      };

      // Activity data from API
      const activity = {
        id: 12345,
        name: 'Morning Run',
        sport_type: 'Run',
        start_date_local: activityStart.toISOString(),
      };

      const completedWithBuffer = new Date(activityStart.getTime() + 90000);
      const shouldIgnore = completedWithBuffer < ignoreBefore;

      expect(shouldIgnore).toBe(true);
    });

    it('should process Strava activities after ignore_before', async () => {
      const ignoreBefore = new Date('2024-01-01T12:00:00Z');
      const activityStart = new Date('2024-01-01T12:30:00Z'); // 30 minutes after
      
      const activity = {
        id: 12346,
        name: 'Afternoon Ride',
        sport_type: 'Ride',
        start_date_local: activityStart.toISOString(),
      };

      const completedWithBuffer = new Date(activityStart.getTime() + 90000);
      const shouldIgnore = completedWithBuffer < ignoreBefore;

      expect(shouldIgnore).toBe(false);
    });
  });

  describe('Deduplication', () => {
    it('should generate consistent dedupe_hash for same event', () => {
      const event1 = {
        provider: 'todoist',
        external_id: 'task-123',
        type: 'task.completed',
        completed_at: '2024-01-01T12:00:00Z',
      };

      const event2 = {
        provider: 'todoist',
        external_id: 'task-123',
        type: 'task.completed',
        completed_at: '2024-01-01T12:00:00Z',
      };

      const hash1 = `${event1.provider}|${event1.external_id}|${event1.type}|${event1.completed_at}`;
      const hash2 = `${event2.provider}|${event2.external_id}|${event2.type}|${event2.completed_at}`;

      expect(hash1).toBe(hash2);
    });

    it('should generate different dedupe_hash for different events', () => {
      const event1 = {
        provider: 'todoist',
        external_id: 'task-123',
        type: 'task.completed',
        completed_at: '2024-01-01T12:00:00Z',
      };

      const event2 = {
        provider: 'todoist',
        external_id: 'task-124',
        type: 'task.completed',
        completed_at: '2024-01-01T12:00:00Z',
      };

      const hash1 = `${event1.provider}|${event1.external_id}|${event1.type}|${event1.completed_at}`;
      const hash2 = `${event2.provider}|${event2.external_id}|${event2.type}|${event2.completed_at}`;

      expect(hash1).not.toBe(hash2);
    });
  });
});
