import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';

interface ChallengeListOptions {
  pageSize?: number;
  filter?: string;
  sortBy?: 'created_at' | 'participant_count' | 'end_date';
  sortOrder?: 'asc' | 'desc';
  category?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  is_team_based: boolean;
  max_team_size: number;
  status: string;
  participant_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
    team_id?: string;
  };
}

interface PaginatedChallenges {
  challenges: Challenge[];
  totalCount: number;
  hasMore: boolean;
  nextPage: number | null;
}

export const useOptimizedChallenges = (options: ChallengeListOptions = {}) => {
  const {
    pageSize = 10,
    filter = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    category = 'all'
  } = options;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const { user } = useAuthOptimized();
  const cacheRef = useRef<Map<string, PaginatedChallenges>>(new Map());
  const subscriptionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key based on options
  const getCacheKey = useCallback(() => {
    return `challenges_${category}_${sortBy}_${sortOrder}_${filter}_${pageSize}`;
  }, [category, sortBy, sortOrder, filter, pageSize]);

  // Optimized fetch with caching and pagination
  const fetchChallenges = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!user) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const cacheKey = getCacheKey();
    const pageKey = `${cacheKey}_page_${page}`;
    
    // Check cache first for this specific page
    if (cacheRef.current.has(pageKey) && !reset) {
      const cached = cacheRef.current.get(pageKey)!;
      if (page === 0) {
        setChallenges(cached.challenges);
        setTotalCount(cached.totalCount);
      } else {
        setChallenges(prev => [...prev, ...cached.challenges]);
      }
      setHasMore(cached.hasMore);
      setCurrentPage(page);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const offset = page * pageSize;
      
      // Build query with optimizations
      let query = supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          challenge_type,
          target_value,
          target_unit,
          start_date,
          end_date,
          max_participants,
          is_team_based,
          max_team_size,
          status,
          challenge_participants!left(
            user_id,
            current_progress,
            status,
            team_id
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .range(offset, offset + pageSize - 1);

      // Apply filters
      if (category !== 'all') {
        query = query.eq('challenge_type', category);
      }
      
      if (filter) {
        query = query.or(`title.ilike.%${filter}%,description.ilike.%${filter}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: fetchError, count } = await query.abortSignal(abortControllerRef.current.signal);

      if (fetchError) throw fetchError;

      // Process challenges with participant counts and user participation
      const processedChallenges = (data || []).map(challenge => {
        const participants = challenge.challenge_participants || [];
        const participant_count = participants.length;
        const user_participation = participants.find(p => p.user_id === user.id);

        return {
          ...challenge,
          challenge_participants: undefined, // Remove to clean up response
          participant_count,
          user_participation: user_participation ? {
            current_progress: user_participation.current_progress,
            status: user_participation.status,
            team_id: user_participation.team_id,
          } : undefined,
        };
      });

      const totalCount = count || 0;
      const hasMore = offset + pageSize < totalCount;

      // Cache the result
      const result: PaginatedChallenges = {
        challenges: processedChallenges,
        totalCount,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      };
      
      cacheRef.current.set(pageKey, result);

      // Update state
      if (page === 0 || reset) {
        setChallenges(processedChallenges);
      } else {
        setChallenges(prev => [...prev, ...processedChallenges]);
      }
      
      setTotalCount(totalCount);
      setHasMore(hasMore);
      setCurrentPage(page);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch challenges');
        console.error('Error fetching challenges:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user, pageSize, getCacheKey, sortBy, sortOrder, category, filter]);

  // Load more challenges (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchChallenges(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, fetchChallenges]);

  // Refresh challenges (clear cache and reload)
  const refreshChallenges = useCallback(() => {
    cacheRef.current.clear();
    setCurrentPage(0);
    fetchChallenges(0, true);
  }, [fetchChallenges]);

  // Optimized real-time subscription
  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for challenges
    const channel = supabase
      .channel('challenges_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `status=eq.active`,
        },
        (payload) => {
          console.log('Challenge update:', payload);
          
          // Invalidate cache for affected entries
          const cacheKey = getCacheKey();
          const keysToDelete: string[] = [];
          
          cacheRef.current.forEach((_, key) => {
            if (key.startsWith(cacheKey)) {
              keysToDelete.push(key);
            }
          });
          
          keysToDelete.forEach(key => cacheRef.current.delete(key));
          
          // Refresh current view
          fetchChallenges(0, true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
        },
        (payload) => {
          console.log('Participant update:', payload);
          
          // Invalidate cache and refresh
          cacheRef.current.clear();
          fetchChallenges(0, true);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [user, fetchChallenges, getCacheKey]);

  // Initial fetch
  useEffect(() => {
    fetchChallenges(0, true);
  }, [fetchChallenges]);

  // Join challenge with optimistic updates
  const joinChallenge = useCallback(async (challengeId: string, teamId?: string) => {
    if (!user) return;

    // Optimistic update
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            participant_count: (challenge.participant_count || 0) + 1,
            user_participation: {
              current_progress: 0,
              status: 'active',
              team_id: teamId,
            }
          }
        : challenge
    ));

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          team_id: teamId,
        });

      if (error) throw error;

      // Clear cache to ensure fresh data on next fetch
      cacheRef.current.clear();
      
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      
      // Revert optimistic update on error
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? {
              ...challenge,
              participant_count: Math.max((challenge.participant_count || 1) - 1, 0),
              user_participation: undefined,
            }
          : challenge
      ));
      throw error;
    }
  }, [user]);

  // Leave challenge with optimistic updates
  const leaveChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    // Optimistic update
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            participant_count: Math.max((challenge.participant_count || 1) - 1, 0),
            user_participation: undefined,
          }
        : challenge
    ));

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear cache
      cacheRef.current.clear();
      
    } catch (error: any) {
      console.error('Error leaving challenge:', error);
      
      // Revert optimistic update on error
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? {
              ...challenge,
              participant_count: (challenge.participant_count || 0) + 1,
              user_participation: {
                current_progress: 0,
                status: 'active',
              }
            }
          : challenge
      ));
      throw error;
    }
  }, [user]);

  return {
    challenges,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refreshChallenges,
    joinChallenge,
    leaveChallenge,
  };
};