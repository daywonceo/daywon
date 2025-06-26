
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';

interface TodayProgressSummaryProps {
  userHabits?: string[];
}

const TodayProgressSummary: React.FC<TodayProgressSummaryProps> = ({ userHabits }) => {
  const { todayStats, streakStats } = useHabitStats(userHabits);
  
  const todayPercentage = todayStats.totalHabits > 0 
    ? Math.round((todayStats.completedCount / todayStats.totalHabits) * 100) 
    : 0;

  return (
    <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700/50 mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {todayStats.completedCount}/{todayStats.totalHabits}
              </p>
              <p className="text-xs text-gray-500">habits</p>
            </div>
            {streakStats.bestStreak > 0 && (
              <div className="text-right border-l border-gray-200 dark:border-gray-600 pl-3">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {streakStats.bestStreak}
                </p>
                <p className="text-xs text-gray-500">best streak</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <Progress 
            value={todayPercentage} 
            className="h-1.5 bg-gray-100 dark:bg-gray-700"
            useGradient={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayProgressSummary;
