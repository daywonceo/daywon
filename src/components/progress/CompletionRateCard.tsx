
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { useHabits } from '@/hooks/useHabits';

interface CompletionRateCardProps {
  userHabits?: string[];
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ userHabits }) => {
  const { habits } = useHabits();
  
  // Use all active habits instead of just the default ones
  const activeHabitNames = userHabits || habits?.filter(h => h.status === 'active').map(h => h.name) || [];
  
  const { weeklyStats } = useHabitStats(activeHabitNames);

  // Determine color based on completion percentage
  const getCompletionColors = (percentage: number) => {
    if (percentage >= 80) {
      return {
        border: 'border-t-completion-high',
        text: 'text-completion-high',
        icon: 'text-completion-high'
      };
    } else if (percentage >= 40) {
      return {
        border: 'border-t-completion-medium',
        text: 'text-completion-medium',
        icon: 'text-completion-medium'
      };
    } else {
      return {
        border: 'border-t-completion-low',
        text: 'text-completion-low',
        icon: 'text-completion-low'
      };
    }
  };

  const colors = getCompletionColors(weeklyStats.percentage);

  return (
    <Card className={`bg-white dark:bg-gray-800/50 border-t-4 ${colors.border} shadow-md transition-colors duration-300`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className={`h-5 w-5 ${colors.icon} transition-colors duration-300`} />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completion Rate (Last 7 Days)
          </h3>
        </div>
        
        <div className="space-y-3">
          <p className={`text-2xl sm:text-3xl font-bold ${colors.text} transition-colors duration-300`}>
            {weeklyStats.percentage}%
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You've completed {weeklyStats.completedCount} of {weeklyStats.totalPossible} habits in the last 7 days
          </p>
          
          <div className="relative">
            <Progress 
              value={weeklyStats.percentage} 
              className="h-2 bg-gray-100 dark:bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out ${
                weeklyStats.percentage >= 80 ? 'bg-completion-high' :
                weeklyStats.percentage >= 40 ? 'bg-completion-medium' : 
                'bg-completion-low'
              }`}
              style={{ width: `${weeklyStats.percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
