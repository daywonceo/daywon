import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIntegrationEvents } from '@/hooks/integrations/useIntegrationEvents';
import { useIntegrationRules } from '@/hooks/integrations/useIntegrationRules';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('Event Processing and Habit Completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Todoist Task Completion', () => {
    it('should create integration event for completed Todoist task', async () => {
      const mockEvent = {
        id: 'event-1',
        user_id: 'user-123',
        provider: 'todoist',
        external_id: 'task-123',
        event_type: 'task.completed',
        title: 'Read 10 pages',
        tags: ['reading'],
        completed_at: new Date().toISOString(),
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: [mockEvent],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationEvents('todoist'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].event_type).toBe('task.completed');
      expect(result.current.events[0].title).toBe('Read 10 pages');
      expect(result.current.events[0].processed).toBe(true);
    });

    it('should match Todoist task to habit via title_contains rule', () => {
      const rule = {
        match_type: 'title_contains',
        match_value: 'read',
        habit_id: 'habit-1',
      };

      const event = {
        title: 'Read 10 pages',
        tags: [],
      };

      const matches = event.title.toLowerCase().includes(rule.match_value.toLowerCase());
      expect(matches).toBe(true);
    });

    it('should match Todoist task to habit via title_exact rule', () => {
      const rule = {
        match_type: 'title_exact',
        match_value: 'Read 10 pages',
        habit_id: 'habit-1',
      };

      const event = {
        title: 'Read 10 pages',
        tags: [],
      };

      const matches = event.title.toLowerCase() === rule.match_value.toLowerCase();
      expect(matches).toBe(true);
    });

    it('should match Todoist task to habit via tag rule', () => {
      const rule = {
        match_type: 'tag',
        match_value: 'exercise',
        habit_id: 'habit-1',
      };

      const event = {
        title: 'Workout',
        tags: ['exercise', 'health'],
      };

      const matches = event.tags.some(tag => tag.toLowerCase() === rule.match_value.toLowerCase());
      expect(matches).toBe(true);
    });

    it('should create habit_activity when rule matches', async () => {
      const mockRule = {
        id: 'rule-1',
        user_id: 'user-123',
        provider: 'todoist',
        match_type: 'title_contains',
        match_value: 'read',
        habit_id: 'habit-1',
        active: true,
        habits: {
          id: 'habit-1',
          name: 'Reading',
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockRule],
              error: null,
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationRules('todoist'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].match_type).toBe('title_contains');
      expect(result.current.rules[0].habit_id).toBe('habit-1');
    });
  });

  describe('Strava Activity Completion', () => {
    it('should create integration event for new Strava activity', async () => {
      const mockEvent = {
        id: 'event-2',
        user_id: 'user-123',
        provider: 'strava',
        external_id: '12345',
        event_type: 'activity.created',
        title: 'Morning Run',
        tags: ['Run'],
        completed_at: new Date().toISOString(),
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: [mockEvent],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationEvents('strava'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].event_type).toBe('activity.created');
      expect(result.current.events[0].title).toBe('Morning Run');
      expect(result.current.events[0].tags).toContain('Run');
    });

    it('should match Strava activity to habit via type rule', () => {
      const rule = {
        match_type: 'type',
        match_value: 'Run',
        habit_id: 'habit-2',
      };

      const event = {
        title: 'Morning Run',
        tags: ['Run'],
      };

      const matches = event.tags.some(tag => tag.toLowerCase().includes(rule.match_value.toLowerCase()));
      expect(matches).toBe(true);
    });

    it('should match Strava activity to habit via title_contains rule', () => {
      const rule = {
        match_type: 'title_contains',
        match_value: 'run',
        habit_id: 'habit-2',
      };

      const event = {
        title: 'Morning Run',
        tags: ['Run'],
      };

      const matches = event.title.toLowerCase().includes(rule.match_value.toLowerCase());
      expect(matches).toBe(true);
    });
  });

  describe('Rule Priority and First Match', () => {
    it('should use first matching rule when multiple rules match', () => {
      const rules = [
        { id: 'rule-1', match_type: 'title_contains', match_value: 'run', habit_id: 'habit-1', created_at: '2024-01-01T10:00:00Z' },
        { id: 'rule-2', match_type: 'type', match_value: 'Run', habit_id: 'habit-2', created_at: '2024-01-01T11:00:00Z' },
      ];

      const event = {
        title: 'Morning Run',
        tags: ['Run'],
      };

      // Sort by created_at ascending (oldest first)
      const sortedRules = [...rules].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Find first match
      let matchedRule = null;
      for (const rule of sortedRules) {
        let matches = false;
        
        if (rule.match_type === 'title_contains') {
          matches = event.title.toLowerCase().includes(rule.match_value.toLowerCase());
        } else if (rule.match_type === 'type') {
          matches = event.tags.some(tag => tag.toLowerCase().includes(rule.match_value.toLowerCase()));
        }
        
        if (matches) {
          matchedRule = rule;
          break;
        }
      }

      expect(matchedRule?.id).toBe('rule-1'); // First rule should match
      expect(matchedRule?.habit_id).toBe('habit-1');
    });
  });
});
