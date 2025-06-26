
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';

interface CompletionRateCardProps {
  userHabits?: string[];
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ userHabits }) => {
  const { weeklyStats } = useHabitStats(userHabits);

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-green-500 shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completion Rate This Week
          </h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {weeklyStats.percentage}%
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You've completed {weeklyStats.completedCount} of {weeklyStats.totalPossible} habits this week
          </p>
          
          <Progress 
            value={weeklyStats.percentage} 
            className="h-2 bg-gray-100 dark:bg-gray-700"
            useGradient={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
