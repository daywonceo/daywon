
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Flame } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { formatStreakNumber } from '@/utils/habitStreaks';

interface CompletionRateCardProps {
  userHabits?: string[];
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ userHabits }) => {
  const { weeklyStats, streakStats, todayStats } = useHabitStats(userHabits);

  return (
    <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700/50">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Progress */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-1" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {todayStats.completedCount}/{todayStats.totalHabits}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Today</p>
          </div>

          {/* Longest Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-1" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatStreakNumber(streakStats.longestStreak)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
          </div>

          {/* Weekly Progress */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {weeklyStats.percentage}%
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">This Week</p>
          </div>
        </div>

        <div className="mt-4">
          <Progress 
            value={weeklyStats.percentage} 
            className="h-2 bg-gray-100 dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {weeklyStats.completedCount} of {weeklyStats.totalPossible} habits completed this week
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
