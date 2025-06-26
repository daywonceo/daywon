
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { formatStreakNumber } from '@/utils/habitStreaks';

interface MilestoneTrackerProps {
  userHabits?: string[];
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ userHabits }) => {
  const { streakStats } = useHabitStats(userHabits);

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-blue-500 shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Longest Streak
          </h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatStreakNumber(streakStats.longestStreak)} days
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {streakStats.longestStreakHabit ? (
              <>Your best streak was for <span className="font-semibold">{streakStats.longestStreakHabit}</span></>
            ) : (
              "Start completing habits to build your first streak!"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTracker;
