import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParticipantProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  last_progress_update: string;
  status: string;
  team_id?: string;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface Milestone {
  id: string;
  percentage: number;
  title: string;
  description: string;
  icon: string;
}

interface ChallengeProgressData {
  challengeId: string;
  participants: ParticipantProgress[];
  targetValue: number;
  targetUnit: string;
  milestones: Milestone[];
  leaderboard: ParticipantProgress[];
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: '1', percentage: 25, title: '🌱 Getting Started', description: 'Quarter way there!', icon: '🌱' },
  { id: '2', percentage: 50, title: '🔥 Halfway Hero', description: 'You\'re on fire!', icon: '🔥' },
  { id: '3', percentage: 75, title: '⭐ Almost There', description: 'So close to the finish!', icon: '⭐' },
  { id: '4', percentage: 100, title: '🏆 Champion', description: 'Goal achieved!', icon: '🏆' },
];

export const useChallengeProgress = (challengeId?: string) => {
  const [progressData, setProgressData] = useState<ChallengeProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentMilestones, setRecentMilestones] = useState<Array<{
    participant: ParticipantProgress;
    milestone: Milestone;
    timestamp: Date;
  }>>([]);
  const { toast } = useToast();

  // Fetch initial progress data
  const fetchProgressData = useCallback(async () => {
    if (!challengeId) return;
    
    try {
      setLoading(true);

      // Get challenge details and participant progress
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select(`
          id,
          target_value,
          target_unit,
          challenge_participants (
            id,
            user_id,
            current_progress,
            last_progress_update,
            status,
            team_id,
            profiles (
              display_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      if (challengeData) {
        const participants = (challengeData.challenge_participants || []).map(p => ({
          ...p,
          challenge_id: challengeId,
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
        }));
        const leaderboard = [...participants]
          .filter(p => p.status === 'active')
          .sort((a, b) => b.current_progress - a.current_progress);

        setProgressData({
          challengeId,
          participants,
          targetValue: challengeData.target_value || 100,
          targetUnit: challengeData.target_unit || 'points',
          milestones: DEFAULT_MILESTONES,
          leaderboard,
        });
      }
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      toast({
        title: "Error",
        description: "Failed to load challenge progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [challengeId, toast]);

  // Check for milestone achievements
  const checkMilestones = useCallback((oldProgress: number, newProgress: number, participant: ParticipantProgress, targetValue: number) => {
    if (!progressData) return;

    const oldPercentage = (oldProgress / targetValue) * 100;
    const newPercentage = (newProgress / targetValue) * 100;

    const achievedMilestones = DEFAULT_MILESTONES.filter(milestone => 
      oldPercentage < milestone.percentage && newPercentage >= milestone.percentage
    );

    achievedMilestones.forEach(milestone => {
      const milestoneAchievement = {
        participant,
        milestone,
        timestamp: new Date(),
      };

      setRecentMilestones(prev => [milestoneAchievement, ...prev.slice(0, 9)]);

      // Show milestone toast
      toast({
        title: `${milestone.icon} Milestone Achieved!`,
        description: `${participant.profiles?.display_name || 'Someone'} reached ${milestone.title}`,
      });
    });
  }, [progressData, toast]);

  // Update participant progress
  const updateProgress = useCallback(async (participantId: string, newProgress: number) => {
    if (!progressData) return { success: false };

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({
          current_progress: newProgress,
          last_progress_update: new Date().toISOString(),
        })
        .eq('id', participantId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [progressData, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!challengeId) return;

    fetchProgressData();

    // Subscribe to challenge participant changes
    const channel = supabase
      .channel(`challenge-progress-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${challengeId}`,
        },
        (payload) => {
          console.log('Progress update received:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProgressData(prev => {
              if (!prev) return prev;

              const updatedParticipants = prev.participants.map(p => {
                if (p.id === payload.new.id) {
                  const oldProgress = p.current_progress;
                  const newProgress = payload.new.current_progress;
                  
                  // Check for milestone achievements
                  if (newProgress > oldProgress) {
                    checkMilestones(oldProgress, newProgress, p, prev.targetValue);
                  }
                  
                  return { ...p, ...payload.new };
                }
                return p;
              });

              const leaderboard = [...updatedParticipants]
                .filter(p => p.status === 'active')
                .sort((a, b) => b.current_progress - a.current_progress);

              return {
                ...prev,
                participants: updatedParticipants,
                leaderboard,
              };
            });
          }

          if (payload.eventType === 'INSERT' && payload.new) {
            // Refetch data when new participant joins
            fetchProgressData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, fetchProgressData, checkMilestones]);

  // Calculate progress statistics
  const getProgressStats = useCallback(() => {
    if (!progressData) return null;

    const activeParticipants = progressData.participants.filter(p => p.status === 'active');
    const totalProgress = activeParticipants.reduce((sum, p) => sum + p.current_progress, 0);
    const averageProgress = activeParticipants.length > 0 ? totalProgress / activeParticipants.length : 0;
    const completedCount = activeParticipants.filter(p => p.current_progress >= progressData.targetValue).length;
    const averagePercentage = (averageProgress / progressData.targetValue) * 100;

    return {
      activeParticipants: activeParticipants.length,
      totalProgress,
      averageProgress,
      averagePercentage: Math.min(averagePercentage, 100),
      completedCount,
      completionRate: activeParticipants.length > 0 ? (completedCount / activeParticipants.length) * 100 : 0,
    };
  }, [progressData]);

  return {
    progressData,
    loading,
    recentMilestones,
    updateProgress,
    refreshProgress: fetchProgressData,
    getProgressStats,
    clearRecentMilestones: () => setRecentMilestones([]),
  };
};