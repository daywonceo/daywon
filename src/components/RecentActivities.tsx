
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
      <CardContent className="p-4 sm:p-8 md:p-10">
        <div className="grid grid-cols-[3.5rem_repeat(3,3.5rem)] sm:grid-cols-[5rem_repeat(3,5rem)] gap-3 sm:gap-6 md:gap-8 items-center justify-center max-w-fit mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-center py-1 sm:py-2">
            <span className="text-xs sm:text-base font-bold text-muted-foreground text-center">
              Day
            </span>
          </div>
          {userHabits.map((habit) => (
            <div key={habit} className="flex items-center justify-center py-1 sm:py-2">
              <span className="text-xs sm:text-base font-bold text-muted-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
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
                <div className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20">
                  <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-full" />
                </div>
                {/* Habit status boxes skeleton */}
                {userHabits.map((_, habitIndex) => (
                  <div key={`skeleton-${index}-${habitIndex}`} className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20">
                    <Skeleton className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg" />
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
