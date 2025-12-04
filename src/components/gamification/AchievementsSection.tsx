import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Target, Heart, Sparkles } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { getAchievementsByCategory } from '@/data/achievements';
import AchievementBadge from './AchievementBadge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { id: 'streak' as const, label: 'Streaks', icon: Flame },
  { id: 'milestone' as const, label: 'Milestones', icon: Target },
  { id: 'social' as const, label: 'Social', icon: Heart },
  { id: 'special' as const, label: 'Special', icon: Sparkles },
];

const AchievementsSection: React.FC = () => {
  const { achievements, loading, isEarned, getEarnedDate, checkAndAwardAchievements } = useAchievements();

  // Check for new achievements on mount
  useEffect(() => {
    checkAndAwardAchievements();
  }, [checkAndAwardAchievements]);

  const earnedCount = achievements.filter(a => isEarned(a.id)).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  if (loading) {
    return (
      <Card className="bg-card border">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-14 h-14 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {earnedCount}/{totalCount} ({progressPercent}%)
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map((category) => {
          const categoryAchievements = getAchievementsByCategory(category.id);
          const Icon = category.icon;
          
          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {category.label}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {categoryAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={isEarned(achievement.id)}
                    earnedDate={getEarnedDate(achievement.id)}
                    size="md"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;
