import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { getHabitActivities } from '@/utils/habitActivity';
import { endOfDay, eachDayOfInterval, startOfDay, subDays } from 'date-fns';

interface WeeklyProgressDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userHabits?: string[];
}

const WeeklyProgressDetailModal: React.FC<WeeklyProgressDetailModalProps> = ({
  open,
  onOpenChange,
  userHabits,
}) => {
  const { habits } = useHabits();
  const activeHabits = userHabits 
    ? habits?.filter(h => userHabits.includes(h.name))
    : habits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at) || [];

  // Calculate weekly stats for each habit
  const habitStats = activeHabits?.map(habit => {
    const weekEnd = endOfDay(new Date());
    const weekStart = startOfDay(subDays(new Date(), 6)); // Last 7 days including today
    const allActivities = getHabitActivities();
    
    // Filter activities for this specific habit within the week
    const habitActivities = allActivities.filter(
      a => a.habitId === habit.id && 
      new Date(a.date) >= weekStart && 
      new Date(a.date) <= weekEnd &&
      a.status === 'completed'
    );

    // Calculate expected days: only count days from habit creation or week start (whichever is later)
    const habitCreated = new Date(habit.created_at);
    const effectiveStart = habitCreated > weekStart ? habitCreated : weekStart;
    const daysInPeriod = eachDayOfInterval({ start: effectiveStart, end: weekEnd });
    
    const completedDays = habitActivities.length;
    const totalDays = daysInPeriod.length;
    const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      habit,
      completedDays,
      totalDays,
      percentage,
    };
  }).sort((a, b) => b.percentage - a.percentage) || [];

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 60) return 'text-primary/80';
    if (percentage >= 40) return 'text-completion-medium';
    return 'text-completion-low';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-primary';
    if (percentage >= 60) return 'bg-primary/80';
    if (percentage >= 40) return 'bg-completion-medium';
    return 'bg-completion-low';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Habit Breakdown
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {habitStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active habits to track
            </p>
          ) : (
            habitStats.map(({ habit, completedDays, totalDays, percentage }) => (
              <div
                key={habit.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground capitalize">
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${getPercentageColor(percentage)}`}>
                    {percentage}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {completedDays} / {totalDays} days
                    </span>
                  </div>

                  <div className="relative">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(percentage)} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>{completedDays} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-muted-foreground/60" />
                      <span>{totalDays - completedDays} missed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {habitStats.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Week Summary</p>
              <p>
                Tracking {habitStats.length} habit{habitStats.length !== 1 ? 's' : ''} over the last 7 days
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyProgressDetailModal;
