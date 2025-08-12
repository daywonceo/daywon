
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  userId: string;
  displayName?: string;
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

      // Use anonymized leaderboard function for enhanced privacy
      const { data: anonymizedData, error: leaderboardError } = await supabase
        .rpc('get_anonymized_leaderboard', { score_period_param: period });

      if (leaderboardError) {
        console.error('Error fetching anonymized leaderboard:', leaderboardError);
        return;
      }

      // Create anonymized leaderboard entries (no user identification for privacy)
      const leaderboardEntries: LeaderboardEntry[] = (anonymizedData || []).map((score) => {
        return {
          userId: 'anonymous', // Privacy: Don't expose user IDs
          displayName: `Rank #${score.rank_position}`, // Anonymized display
          totalScore: score.total_score,
          consistencyRate: score.consistency_rate,
          streakScore: 0, // Not exposed in anonymized view for privacy
          varietyScore: 0, // Not exposed in anonymized view for privacy
          recencyScore: 0, // Not exposed in anonymized view for privacy
          rankPosition: score.rank_position,
          periodStart: '',
          periodEnd: ''
        };
      });

      setLeaderboard(leaderboardEntries);

      // For privacy, don't show current user's rank in public leaderboard
      setUserRank(null);

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
