
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  userId: string;
  email?: string;
  totalScore: number;
  consistencyRate: number;
  streakScore: number;
  varietyScore: number;
  recencyScore: number;
  rankPosition: number;
  periodStart: string;
  periodEnd: string;
}

export const useLeaderboard = (period: 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Get the most recent period for the specified timeframe
      const { data: periodsData, error: periodsError } = await supabase
        .from('user_habit_scores')
        .select('period_start')
        .eq('score_period', period)
        .order('period_start', { ascending: false })
        .limit(1);

      if (periodsError) {
        console.error('Error fetching periods:', periodsError);
        return;
      }

      if (!periodsData || periodsData.length === 0) {
        setLeaderboard([]);
        setUserRank(null);
        return;
      }

      const latestPeriod = periodsData[0].period_start;

      // Fetch leaderboard data for the latest period
      const { data: scoresData, error: scoresError } = await supabase
        .from('user_habit_scores')
        .select(`
          user_id,
          total_score,
          consistency_rate,
          streak_score,
          variety_score,
          recency_score,
          period_start,
          period_end
        `)
        .eq('score_period', period)
        .eq('period_start', latestPeriod)
        .order('total_score', { ascending: false });

      if (scoresError) {
        console.error('Error fetching scores:', scoresError);
        return;
      }

      // Get user profiles for email addresses
      const userIds = scoresData?.map(score => score.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      // Create leaderboard entries with rankings
      const leaderboardEntries: LeaderboardEntry[] = (scoresData || []).map((score, index) => {
        const profile = profilesData?.find(p => p.id === score.user_id);
        return {
          userId: score.user_id,
          email: profile?.email || 'Unknown User',
          totalScore: score.total_score,
          consistencyRate: score.consistency_rate,
          streakScore: score.streak_score,
          varietyScore: score.variety_score,
          recencyScore: score.recency_score,
          rankPosition: index + 1,
          periodStart: score.period_start,
          periodEnd: score.period_end
        };
      });

      setLeaderboard(leaderboardEntries);

      // Find current user's rank
      const currentUserRank = leaderboardEntries.find(entry => entry.userId === user?.id);
      setUserRank(currentUserRank || null);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period, user]);

  return {
    leaderboard,
    userRank,
    isLoading,
    refetch: fetchLeaderboard
  };
};
