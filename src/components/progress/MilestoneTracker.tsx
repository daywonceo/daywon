
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

  // Determine style based on streak length using design system
  const getStreakStyle = (streak: number) => {
    if (streak >= 30) {
      return {
        iconBg: 'gradient-primary',
        iconColor: 'text-primary-foreground',
        textColor: 'text-primary dark:text-primary',
        numberColor: 'text-primary dark:text-primary',
        icon: Trophy
      };
    } else if (streak >= 14) {
      return {
        iconBg: 'bg-completion-medium',
        iconColor: 'text-white',
        textColor: 'text-completion-medium dark:text-completion-medium',
        numberColor: 'text-completion-medium dark:text-completion-medium',
        icon: Flame
      };
    } else if (streak >= 7) {
      return {
        iconBg: 'bg-completion-medium/80',
        iconColor: 'text-white',
        textColor: 'text-completion-medium dark:text-completion-medium',
        numberColor: 'text-completion-medium dark:text-completion-medium',
        icon: Award
      };
    } else {
      return {
        iconBg: 'bg-primary/80',
        iconColor: 'text-white',
        textColor: 'text-primary dark:text-primary',
        numberColor: 'text-primary dark:text-primary',
        icon: Flame
      };
    }
  };

  const style = getStreakStyle(streakStats.longestStreak);
  const IconComponent = style.icon;

  return (
    <Card className="glass-card group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
              <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Best Streak
              </h3>
              <p className="text-xs text-muted-foreground">
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your longest streak was{' '}
                <span className={`font-semibold ${style.textColor}`}>
                  {streakStats.longestStreakHabit}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
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
