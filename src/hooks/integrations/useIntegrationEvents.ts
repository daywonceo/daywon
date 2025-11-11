import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface IntegrationEvent {
  id: string;
  user_id: string;
  provider: string;
  external_id: string;
  event_type: string;
  title: string | null;
  tags: string[] | null;
  completed_at: string;
  payload: any;
  dedupe_hash: string;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

interface UseIntegrationEventsOptions {
  pageSize?: number;
}

export function useIntegrationEvents(
  provider: 'todoist' | 'strava',
  options: UseIntegrationEventsOptions = {}
) {
  const { user } = useAuth();
  const { pageSize = 10 } = options;
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchEvents = async (pageNumber: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const from = pageNumber * pageSize;
      const to = from + pageSize;

      const { data, error, count } = await supabase
        .from('integration_events')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .range(from, to - 1);

      if (error) throw error;

      if (pageNumber === 0) {
        setEvents(data || []);
      } else {
        setEvents((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((count || 0) > to);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchEvents(page + 1);
    }
  };

  const refetch = () => {
    setPage(0);
    fetchEvents(0);
  };

  useEffect(() => {
    fetchEvents(0);
  }, [user, provider]);

  // Real-time subscription for new events
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('integration-events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'integration_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newEvent = payload.new as IntegrationEvent;
          if (newEvent.provider === provider) {
            setEvents((prev) => [newEvent, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'integration_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedEvent = payload.new as IntegrationEvent;
          if (updatedEvent.provider === provider) {
            setEvents((prev) =>
              prev.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, provider]);

  return {
    events,
    loading,
    hasMore,
    loadMore,
    refetch,
  };
}
