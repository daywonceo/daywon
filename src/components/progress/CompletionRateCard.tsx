import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target } from 'lucide-react';
import { useHabitStats } from '@/hooks/useHabitStats';
import { useHabits } from '@/hooks/useHabits';
import WeeklyProgressDetailModal from './WeeklyProgressDetailModal';

interface CompletionRateCardProps {
  userHabits?: string[];
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ userHabits }) => {
  const { habits } = useHabits();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Use all active habits instead of just the default ones (exclude ended and archived)
  const activeHabitNames = userHabits || habits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at).map(h => h.name) || [];
  
  const { weeklyStats } = useHabitStats(activeHabitNames);

  // Listen for habit updates to refresh progress
  useEffect(() => {
    const handleHabitUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('habitUpdated', handleHabitUpdate);
    window.addEventListener('habitStatusChanged', handleHabitUpdate);

    return () => {
      window.removeEventListener('habitUpdated', handleHabitUpdate);
      window.removeEventListener('habitStatusChanged', handleHabitUpdate);
    };
  }, []);

  // Determine gradient and colors based on completion percentage using design system
  const getCompletionStyle = (percentage: number) => {
    if (percentage >= 80) {
      return {
        iconBg: 'bg-primary/10 dark:bg-primary/20',
        iconColor: 'text-primary dark:text-primary',
        textColor: 'text-primary dark:text-primary',
        numberColor: 'text-primary dark:text-primary',
        progressColor: 'bg-primary'
      };
    } else if (percentage >= 60) {
      return {
        iconBg: 'bg-primary/10 dark:bg-primary/20',
        iconColor: 'text-primary dark:text-primary',
        textColor: 'text-primary/80 dark:text-primary/80',
        numberColor: 'text-primary/90 dark:text-primary/90',
        progressColor: 'bg-primary/80'
      };
    } else if (percentage >= 40) {
      return {
        iconBg: 'bg-completion-medium/10 dark:bg-completion-medium/20',
        iconColor: 'text-completion-medium dark:text-completion-medium',
        textColor: 'text-completion-medium dark:text-completion-medium',
        numberColor: 'text-completion-medium dark:text-completion-medium',
        progressColor: 'bg-completion-medium'
      };
    } else {
      return {
        iconBg: 'bg-completion-low/10 dark:bg-completion-low/20',
        iconColor: 'text-completion-low dark:text-completion-low',
        textColor: 'text-completion-low dark:text-completion-low',
        numberColor: 'text-completion-low dark:text-completion-low',
        progressColor: 'bg-completion-low'
      };
    }
  };

  const style = getCompletionStyle(weeklyStats.percentage);

  return (
    <>
      <Card 
        className="glass-card group cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => setShowDetailModal(true)}
      >
        <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110 duration-300`}>
              <Target className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Weekly Progress
              </h3>
              <p className="text-xs text-muted-foreground">
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
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            You've completed <span className="font-semibold text-foreground">{weeklyStats.completedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{weeklyStats.totalPossible}</span> habits
          </p>
          
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${style.progressColor} rounded-full transition-all duration-700 ease-out shadow-sm`}
                style={{ width: `${weeklyStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <WeeklyProgressDetailModal 
      open={showDetailModal}
      onOpenChange={setShowDetailModal}
      userHabits={activeHabitNames}
    />
    </>
  );
};

export default CompletionRateCard;
