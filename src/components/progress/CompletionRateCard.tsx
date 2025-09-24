
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { useHabits } from '@/hooks/useHabits';

interface CompletionRateCardProps {
  userHabits?: string[];
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ userHabits }) => {
  const { habits } = useHabits();
  
  // Use all active habits instead of just the default ones (exclude ended and archived)
  const activeHabitNames = userHabits || habits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at).map(h => h.name) || [];
  
  const { weeklyStats } = useHabitStats(activeHabitNames);

  // Determine gradient and colors based on completion percentage
  const getCompletionStyle = (percentage: number) => {
    if (percentage >= 80) {
      return {
        gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
        border: 'border-emerald-200 dark:border-emerald-800',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        numberColor: 'text-emerald-600 dark:text-emerald-400',
        progressColor: 'bg-gradient-to-r from-emerald-400 to-emerald-500'
      };
    } else if (percentage >= 60) {
      return {
        gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
        border: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-700 dark:text-blue-300',
        numberColor: 'text-blue-600 dark:text-blue-400',
        progressColor: 'bg-gradient-to-r from-blue-400 to-blue-500'
      };
    } else if (percentage >= 40) {
      return {
        gradient: 'from-amber-500/20 via-amber-400/10 to-transparent',
        border: 'border-amber-200 dark:border-amber-800',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-500',
        textColor: 'text-amber-700 dark:text-amber-300',
        numberColor: 'text-amber-600 dark:text-amber-400',
        progressColor: 'bg-gradient-to-r from-amber-400 to-amber-500'
      };
    } else {
      return {
        gradient: 'from-red-500/20 via-red-400/10 to-transparent',
        border: 'border-red-200 dark:border-red-800',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-700 dark:text-red-300',
        numberColor: 'text-red-600 dark:text-red-400',
        progressColor: 'bg-gradient-to-r from-red-400 to-red-500'
      };
    }
  };

  const style = getCompletionStyle(weeklyStats.percentage);

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} backdrop-blur-sm border ${style.border} shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"></div>
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110 duration-300`}>
              <Target className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Weekly Progress
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last 7 days
              </p>
            </div>
          </div>
          <div className={`p-2 rounded-full ${style.iconBg}`}>
            <CheckCircle className={`h-4 w-4 ${style.iconColor}`} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${style.numberColor} tracking-tight`}>
              {weeklyStats.percentage}
            </span>
            <span className={`text-lg font-medium ${style.textColor}`}>%</span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            You've completed <span className="font-semibold">{weeklyStats.completedCount}</span> of{' '}
            <span className="font-semibold">{weeklyStats.totalPossible}</span> habits
          </p>
          
          <div className="relative">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${style.progressColor} rounded-full transition-all duration-700 ease-out shadow-sm`}
                style={{ width: `${weeklyStats.percentage}%` }}
              />
            </div>
            <div className="absolute -top-1 right-0 text-xs font-medium text-gray-500 dark:text-gray-400">
              {weeklyStats.percentage >= 80 ? '🔥' : weeklyStats.percentage >= 60 ? '💪' : weeklyStats.percentage >= 40 ? '👍' : '📈'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
