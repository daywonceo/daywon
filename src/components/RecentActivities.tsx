
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabitActivities } from "@/hooks/useHabitActivities";
import HabitActivityRow from "@/components/habit/HabitActivityRow";

interface RecentActivitiesProps {
  habitList?: string[];
  onHabitUpdate?: () => void;
}

const RecentActivities = ({ habitList, onHabitUpdate }: RecentActivitiesProps) => {
  const {
    activities,
    setActivities,
    activeHabit,
    setActiveHabit,
    userHabits,
    toggleStatus,
    toggleEditMode,
    updateActivityText,
    refreshActivities,
    isLoading,
  } = useHabitActivities(habitList);

  // Listen for habit changes to trigger parent updates
  React.useEffect(() => {
    const handleHabitChange = () => {
      onHabitUpdate?.();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the app, refresh streak data
        refreshActivities();
        onHabitUpdate?.();
      }
    };

    const handleFocus = () => {
      // App gained focus, refresh data
      refreshActivities();
      onHabitUpdate?.();
    };

    window.addEventListener('habitStatusChanged', handleHabitChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('habitStatusChanged', handleHabitChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onHabitUpdate, refreshActivities]);

  return (
    <Card className="mb-8 shadow-sm border-border">
      <CardContent className="p-8 sm:p-10">
        <div className="grid grid-cols-[5rem_repeat(3,5rem)] gap-6 sm:gap-8 items-center justify-center max-w-fit mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-center py-2">
            <span className="text-base font-bold text-muted-foreground text-center">
              Day
            </span>
          </div>
          {userHabits.map((habit) => (
            <div key={habit} className="flex items-center justify-center py-2">
              <span className="text-base font-bold text-muted-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">
                {habit}
              </span>
            </div>
          ))}

          {/* Activity rows */}
          {isLoading ? (
            // Enhanced loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <React.Fragment key={`skeleton-${index}`}>
                {/* Day skeleton */}
                <div className="flex items-center justify-center w-20 h-20">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                {/* Habit status boxes skeleton */}
                {userHabits.map((_, habitIndex) => (
                  <div key={`skeleton-${index}-${habitIndex}`} className="flex items-center justify-center w-20 h-20">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                  </div>
                ))}
              </React.Fragment>
            ))
          ) : (
            activities.map((activity, activityIndex) => (
              <HabitActivityRow
                key={activityIndex}
                activity={activity}
                activityIndex={activityIndex}
                activities={activities}
                setActivities={setActivities}
                activeHabit={activeHabit}
                setActiveHabit={setActiveHabit}
                toggleStatus={toggleStatus}
                toggleEditMode={toggleEditMode}
                updateActivityText={updateActivityText}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
