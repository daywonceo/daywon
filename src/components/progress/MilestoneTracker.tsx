
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy, Award } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { formatStreakNumber } from '@/utils/habitStreaks';

interface MilestoneTrackerProps {
  userHabits?: string[];
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ userHabits }) => {
  const { streakStats } = useHabitStats(userHabits);

  // Determine style based on streak length
  const getStreakStyle = (streak: number) => {
    if (streak >= 30) {
      return {
        gradient: 'from-purple-500/20 via-pink-400/10 to-transparent',
        border: 'border-purple-200 dark:border-purple-800',
        iconBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
        iconColor: 'text-white',
        textColor: 'text-purple-700 dark:text-purple-300',
        numberColor: 'text-purple-600 dark:text-purple-400',
        icon: Trophy
      };
    } else if (streak >= 14) {
      return {
        gradient: 'from-orange-500/20 via-red-400/10 to-transparent',
        border: 'border-orange-200 dark:border-orange-800',
        iconBg: 'bg-gradient-to-r from-orange-500 to-red-500',
        iconColor: 'text-white',
        textColor: 'text-orange-700 dark:text-orange-300',
        numberColor: 'text-orange-600 dark:text-orange-400',
        icon: Flame
      };
    } else if (streak >= 7) {
      return {
        gradient: 'from-amber-500/20 via-yellow-400/10 to-transparent',
        border: 'border-amber-200 dark:border-amber-800',
        iconBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        iconColor: 'text-white',
        textColor: 'text-amber-700 dark:text-amber-300',
        numberColor: 'text-amber-600 dark:text-amber-400',
        icon: Award
      };
    } else {
      return {
        gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
        border: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        iconColor: 'text-white',
        textColor: 'text-blue-700 dark:text-blue-300',
        numberColor: 'text-blue-600 dark:text-blue-400',
        icon: Flame
      };
    }
  };

  const style = getStreakStyle(streakStats.longestStreak);
  const IconComponent = style.icon;

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} backdrop-blur-sm border ${style.border} shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"></div>
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
              <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Best Streak
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personal record
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${style.numberColor} tracking-tight`}>
              {formatStreakNumber(streakStats.longestStreak)}
            </span>
            <span className={`text-lg font-medium ${style.textColor}`}>
              {streakStats.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          
          <div className="space-y-2">
            {streakStats.longestStreakHabit ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Your longest streak was{' '}
                <span className={`font-semibold ${style.textColor}`}>
                  {streakStats.longestStreakHabit}
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Start completing habits to build your first streak!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTracker;
