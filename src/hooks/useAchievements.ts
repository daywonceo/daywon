import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ACHIEVEMENTS, Achievement, getAchievementById } from '@/data/achievements';
import { toast } from 'sonner';

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  metadata: Record<string, unknown>;
}

export function useAchievements() {
  const { user } = useAuth();
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEarnedAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const awardAchievement = useCallback(async (achievementId: string, metadata: Record<string, unknown> = {}) => {
    if (!user) return false;

    // Check if already earned
    if (earnedAchievements.some(a => a.achievement_id === achievementId)) {
      return false;
    }

    const achievement = getAchievementById(achievementId);
    if (!achievement) return false;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          metadata,
        });

      if (error) throw error;

      // Show celebration toast
      toast.success(`🏆 Achievement Unlocked!`, {
        description: `${achievement.name}: ${achievement.description}`,
        duration: 5000,
      });

      await fetchAchievements();
      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }, [user, earnedAchievements, fetchAchievements]);

  const checkAndAwardAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch current stats
      const [habitsResult, activitiesResult, friendsResult] = await Promise.all([
        supabase.from('habits').select('id').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('habit_activities').select('id').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('user_relationships').select('id').or(`follower_id.eq.${user.id},following_id.eq.${user.id}`).eq('status', 'accepted'),
      ]);

      const habitCount = habitsResult.data?.length || 0;
      const completionCount = activitiesResult.data?.length || 0;
      const friendCount = Math.floor((friendsResult.data?.length || 0) / 2); // Divide by 2 since relationships are bidirectional

      // Check habit milestones
      if (habitCount >= 1) await awardAchievement('habits_1');
      if (habitCount >= 5) await awardAchievement('habits_5');
      if (habitCount >= 10) await awardAchievement('habits_10');

      // Check completion milestones
      if (completionCount >= 50) await awardAchievement('completions_50');
      if (completionCount >= 100) await awardAchievement('completions_100');
      if (completionCount >= 500) await awardAchievement('completions_500');

      // Check friend milestones
      if (friendCount >= 1) await awardAchievement('friends_1');
      if (friendCount >= 5) await awardAchievement('friends_5');

      // Check early adopter (joined before 2026)
      const profileResult = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (profileResult.data) {
        const joinDate = new Date(profileResult.data.created_at);
        if (joinDate.getFullYear() <= 2025) {
          await awardAchievement('early_adopter');
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user, awardAchievement]);

  const checkStreakAchievements = useCallback(async (streak: number) => {
    if (streak >= 3) await awardAchievement('streak_3');
    if (streak >= 7) await awardAchievement('streak_7');
    if (streak >= 14) await awardAchievement('streak_14');
    if (streak >= 30) await awardAchievement('streak_30');
    if (streak >= 100) await awardAchievement('streak_100');
  }, [awardAchievement]);

  const isEarned = useCallback((achievementId: string) => {
    return earnedAchievements.some(a => a.achievement_id === achievementId);
  }, [earnedAchievements]);

  const getEarnedDate = useCallback((achievementId: string) => {
    const achievement = earnedAchievements.find(a => a.achievement_id === achievementId);
    return achievement?.earned_at;
  }, [earnedAchievements]);

  return {
    achievements: ACHIEVEMENTS,
    earnedAchievements,
    loading,
    isEarned,
    getEarnedDate,
    awardAchievement,
    checkAndAwardAchievements,
    checkStreakAchievements,
    refetch: fetchAchievements,
  };
}
