import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthorizeIntegration } from '@/hooks/integrations/useAuthorizeIntegration';
import { useIntegrationsList } from '@/hooks/integrations/useIntegrationsList';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock window.open
const mockWindowOpen = vi.fn();
global.window.open = mockWindowOpen;

describe('OAuth Connection Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Todoist Connection', () => {
    it('should open OAuth popup when connecting to Todoist', async () => {
      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
          } as any,
        },
        error: null,
      } as any);

      // Mock fetch for authorize endpoint
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          connectUrl: 'https://todoist.com/oauth/authorize?client_id=test&state=encoded-state',
        }),
      });

      const { result } = renderHook(() => useAuthorizeIntegration('todoist'));

      await result.current.authorize();

      // Verify OAuth popup was opened
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('todoist.com/oauth/authorize'),
        'oauth',
        expect.any(String)
      );
    });

    it('should show Connected status after OAuth callback', async () => {
      const mockIntegration = {
        id: 'integration-1',
        user_id: 'user-123',
        integration_type: 'todoist',
        is_connected: true,
        integration_status: 'connected',
        connected_at: new Date().toISOString(),
        ignore_before: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockIntegration],
            error: null,
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationsList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const integration = result.current.getIntegration('todoist');
      
      expect(integration).toBeDefined();
      expect(integration?.is_connected).toBe(true);
      expect(integration?.integration_status).toBe('connected');
      expect(integration?.connected_at).toBeDefined();
      expect(integration?.ignore_before).toBeDefined();
      expect(integration?.connected_at).toBe(integration?.ignore_before);
    });
  });

  describe('Strava Connection', () => {
    it('should open OAuth popup when connecting to Strava', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
          } as any,
        },
        error: null,
      } as any);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          connectUrl: 'https://www.strava.com/oauth/authorize?client_id=test&scope=activity:read_all',
        }),
      });

      const { result } = renderHook(() => useAuthorizeIntegration('strava'));

      await result.current.authorize();

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('strava.com/oauth/authorize'),
        'oauth',
        expect.any(String)
      );
    });

    it('should store connected_at and ignore_before on successful connection', async () => {
      const now = new Date().toISOString();
      const mockIntegration = {
        id: 'integration-2',
        user_id: 'user-123',
        integration_type: 'strava',
        is_connected: true,
        integration_status: 'connected',
        connected_at: now,
        ignore_before: now,
        last_synced_at: now,
        access_token: 'encrypted-token',
        refresh_token: 'encrypted-refresh',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockIntegration],
            error: null,
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationsList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const integration = result.current.getIntegration('strava');
      
      expect(integration?.connected_at).toBe(integration?.ignore_before);
      expect(new Date(integration!.connected_at).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
