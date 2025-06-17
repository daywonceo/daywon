
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';

const MilestoneTracker: React.FC = () => {
  const { streakStats } = useHabitStats();

  const milestoneData = useMemo(() => {
    const milestones = [3, 7, 10, 21, 30, 50, 100];
    const currentBestStreak = streakStats.bestStreak;
    
    // Find the next milestone
    const nextMilestone = milestones.find(milestone => milestone > currentBestStreak);
    const daysUntilMilestone = nextMilestone ? nextMilestone - currentBestStreak : 0;
    
    // Check if we just achieved a milestone
    const justAchieved = milestones.includes(currentBestStreak) && currentBestStreak > 0;
    
    return {
      currentBestStreak,
      bestStreakHabit: streakStats.bestStreakHabit,
      nextMilestone,
      daysUntilMilestone,
      justAchieved
    };
  }, [streakStats]);

  if (milestoneData.justAchieved) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t-4 border-t-yellow-500 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Best Streak Milestone Achieved!
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-yellow-500 text-white">
                {milestoneData.currentBestStreak}-Day Streak
              </Badge>
              {milestoneData.bestStreakHabit && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {milestoneData.bestStreakHabit}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              🎉 Congratulations! You've reached your goal!
            </p>
            
            {milestoneData.nextMilestone && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next goal: {milestoneData.nextMilestone}-day streak
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-blue-500 shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Best Streak Progress
          </h3>
        </div>
        
        <div className="space-y-2">
          {milestoneData.nextMilestone ? (
            <>
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                {milestoneData.daysUntilMilestone} days to go
              </p>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Until your next badge: {milestoneData.nextMilestone}-Day Streak
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Current best: {milestoneData.currentBestStreak} days
                </Badge>
                {milestoneData.bestStreakHabit && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({milestoneData.bestStreakHabit})
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                Amazing!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You've reached all milestones. Keep going!
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Best streak: {milestoneData.currentBestStreak} days
                </Badge>
                {milestoneData.bestStreakHabit && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({milestoneData.bestStreakHabit})
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTracker;
