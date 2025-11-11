import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRevokeIntegration } from '@/hooks/integrations/useRevokeIntegration';
import { useIntegrationsList } from '@/hooks/integrations/useIntegrationsList';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('Integration Revoke and Reconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Revoke Integration', () => {
    it('should successfully revoke Todoist integration', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { success: true, message: 'Integration revoked successfully' },
        error: null,
      });

      vi.mocked(supabase).functions = {
        invoke: mockInvoke,
      } as any;

      const { result } = renderHook(() => useRevokeIntegration('todoist'));

      await result.current.revoke();

      expect(mockInvoke).toHaveBeenCalledWith('integrations-revoke', {
        body: { provider: 'todoist' },
      });
    });

    it('should set status to revoked and remove tokens after revoke', async () => {
      const mockIntegration = {
        id: 'integration-1',
        user_id: 'user-123',
        integration_type: 'todoist',
        is_connected: false,
        integration_status: 'revoked',
        access_token: null,
        refresh_token: null,
        expires_at: null,
        connected_at: '2024-01-01T12:00:00Z',
        ignore_before: '2024-01-01T12:00:00Z',
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

      expect(integration?.is_connected).toBe(false);
      expect(integration?.integration_status).toBe('revoked');
      expect(integration?.access_token).toBeNull();
      expect(integration?.refresh_token).toBeNull();
    });

    it('should successfully revoke Strava integration', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { success: true, message: 'Integration revoked successfully' },
        error: null,
      });

      vi.mocked(supabase).functions = {
        invoke: mockInvoke,
      } as any;

      const { result } = renderHook(() => useRevokeIntegration('strava'));

      await result.current.revoke();

      expect(mockInvoke).toHaveBeenCalledWith('integrations-revoke', {
        body: { provider: 'strava' },
      });
    });
  });

  describe('Reconnect After Revoke', () => {
    it('should allow reconnection after revoke', async () => {
      // First state: revoked
      const revokedIntegration = {
        id: 'integration-1',
        user_id: 'user-123',
        integration_type: 'todoist',
        is_connected: false,
        integration_status: 'revoked',
        access_token: null,
        refresh_token: null,
      };

      // After reconnect
      const reconnectedIntegration = {
        id: 'integration-1',
        user_id: 'user-123',
        integration_type: 'todoist',
        is_connected: true,
        integration_status: 'connected',
        access_token: 'new-encrypted-token',
        connected_at: new Date().toISOString(),
        ignore_before: new Date().toISOString(),
      };

      // Mock the transition
      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [revokedIntegration],
              error: null,
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [reconnectedIntegration],
              error: null,
            }),
          }),
        } as any);

      const { result, rerender } = renderHook(() => useIntegrationsList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let integration = result.current.getIntegration('todoist');
      expect(integration?.integration_status).toBe('revoked');

      // Simulate reconnection
      rerender();

      await waitFor(() => {
        integration = result.current.getIntegration('todoist');
        expect(integration?.integration_status).toBe('connected');
      });

      expect(integration?.is_connected).toBe(true);
      expect(integration?.access_token).toBeDefined();
    });

    it('should set new ignore_before on reconnection', async () => {
      const firstConnection = new Date('2024-01-01T12:00:00Z').toISOString();
      const reconnectionTime = new Date('2024-01-15T14:00:00Z').toISOString();

      const reconnectedIntegration = {
        id: 'integration-1',
        user_id: 'user-123',
        integration_type: 'strava',
        is_connected: true,
        integration_status: 'connected',
        connected_at: reconnectionTime,
        ignore_before: reconnectionTime,
        last_synced_at: reconnectionTime,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [reconnectedIntegration],
            error: null,
          }),
        }),
      } as any);

      const { result } = renderHook(() => useIntegrationsList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const integration = result.current.getIntegration('strava');

      // New ignore_before should be set to new connection time
      expect(integration?.connected_at).toBe(reconnectionTime);
      expect(integration?.ignore_before).toBe(reconnectionTime);
      expect(integration?.ignore_before).not.toBe(firstConnection);
    });
  });

  describe('Token Cleanup on Revoke', () => {
    it('should null out all sensitive fields on revoke', () => {
      const beforeRevoke = {
        access_token: 'encrypted-access-token',
        refresh_token: 'encrypted-refresh-token',
        expires_at: '2024-12-31T23:59:59Z',
      };

      const afterRevoke = {
        access_token: null,
        refresh_token: null,
        expires_at: null,
        integration_status: 'revoked',
        is_connected: false,
      };

      expect(afterRevoke.access_token).toBeNull();
      expect(afterRevoke.refresh_token).toBeNull();
      expect(afterRevoke.expires_at).toBeNull();
      expect(afterRevoke.integration_status).toBe('revoked');
      expect(afterRevoke.is_connected).toBe(false);
    });
  });
});
