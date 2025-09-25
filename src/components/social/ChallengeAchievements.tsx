import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Target, 
  Flame, 
  Users, 
  Crown,
  Star,
  Award,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';
import { toast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

const ChallengeAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const { user } = useAuthOptimized();

  const achievementTemplates = [
    {
      id: 'first_challenge',
      title: 'First Steps',
      description: 'Join your first challenge',
      icon: <Target size={16} />,
      type: 'bronze' as const,
      requirement: 1,
    },
    {
      id: 'challenge_veteran',
      title: 'Challenge Veteran',
      description: 'Complete 5 challenges',
      icon: <Medal size={16} />,
      type: 'silver' as const,
      requirement: 5,
    },
    {
      id: 'challenge_master',
      title: 'Challenge Master',
      description: 'Complete 15 challenges',
      icon: <Trophy size={16} />,
      type: 'gold' as const,
      requirement: 15,
    },
    {
      id: 'streak_starter',
      title: 'Streak Starter',
      description: 'Maintain a 7-day challenge streak',
      icon: <Flame size={16} />,
      type: 'bronze' as const,
      requirement: 7,
    },
    {
      id: 'streak_legend',
      title: 'Streak Legend',
      description: 'Maintain a 30-day challenge streak',
      icon: <Zap size={16} />,
      type: 'platinum' as const,
      requirement: 30,
    },
    {
      id: 'team_player',
      title: 'Team Player',
      description: 'Join 3 team challenges',
      icon: <Users size={16} />,
      type: 'silver' as const,
      requirement: 3,
    },
    {
      id: 'challenge_creator',
      title: 'Challenge Creator',
      description: 'Create your first challenge',
      icon: <Crown size={16} />,
      type: 'gold' as const,
      requirement: 1,
    },
    {
      id: 'popular_creator',
      title: 'Popular Creator',
      description: 'Create a challenge with 50+ participants',
      icon: <Star size={16} />,
      type: 'platinum' as const,
      requirement: 50,
    },
  ];

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get completed challenges count
      const { data: completedChallenges } = await supabase
        .from('challenge_participants')
        .select('challenge_id, challenges!inner(end_date)')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Get created challenges
      const { data: createdChallenges } = await supabase
        .from('challenges')
        .select(`
          id,
          challenge_participants(count)
        `)
        .eq('creator_id', user.id);

      // Get team challenges
      const { data: teamChallenges } = await supabase
        .from('challenge_participants')
        .select('team_id')
        .eq('user_id', user.id)
        .not('team_id', 'is', null);

      // Calculate current streaks (simplified for demo)
      const currentStreak = 7; // This would be calculated based on actual participation

      const stats = {
        completedChallenges: completedChallenges?.length || 0,
        createdChallenges: createdChallenges?.length || 0,
        teamChallenges: teamChallenges?.length || 0,
        maxParticipants: Math.max(...(createdChallenges?.map(c => c.challenge_participants?.length || 0) || [0])),
        currentStreak,
      };

      // Map achievements with current progress
      const mappedAchievements = achievementTemplates.map(template => {
        let current = 0;
        
        switch (template.id) {
          case 'first_challenge':
          case 'challenge_veteran':
          case 'challenge_master':
            current = stats.completedChallenges;
            break;
          case 'streak_starter':
          case 'streak_legend':
            current = stats.currentStreak;
            break;
          case 'team_player':
            current = stats.teamChallenges;
            break;
          case 'challenge_creator':
            current = stats.createdChallenges;
            break;
          case 'popular_creator':
            current = stats.maxParticipants;
            break;
        }

        const unlocked = current >= template.requirement;
        return {
          ...template,
          current,
          unlocked,
          unlockedAt: unlocked ? new Date() : undefined,
        };
      });

      setAchievements(mappedAchievements);

      // Check for new achievements
      const newlyUnlocked = mappedAchievements
        .filter(a => a.unlocked)
        .map(a => a.id);
      
      setNewAchievements(newlyUnlocked);

    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const celebrateAchievement = (achievement: Achievement) => {
    toast({
      title: "🎉 Achievement Unlocked!",
      description: `${achievement.title} - ${achievement.description}`,
    });
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const getTypeColor = (type: Achievement['type']) => {
    switch (type) {
      case 'bronze': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="text-yellow-500" size={20} />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <div className="grid gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="text-yellow-500" size={20} />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all ${
                achievement.unlocked
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
              } ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {achievement.unlocked ? <Trophy size={16} /> : achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 ${getTypeColor(achievement.type)}`}
                      >
                        {achievement.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {achievement.unlocked ? (
                    <Badge variant="default" className="text-xs">
                      Unlocked!
                    </Badge>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {achievement.current}/{achievement.requirement}
                    </div>
                  )}
                </div>
              </div>

              {!achievement.unlocked && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {newAchievements.length > 0 && (
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-400 text-center">
              🎉 {newAchievements.length} new achievement{newAchievements.length > 1 ? 's' : ''} unlocked!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeAchievements;