
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
    <Card className="mb-8 sm:mb-12 border-green-200 shadow-md">
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-[auto_1fr_repeat(3,1fr)] gap-2 sm:gap-4 items-center">
          {/* Header row */}
          <div className="text-center">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 block">
              Day
            </span>
          </div>
          <div className="text-center min-w-0">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 block truncate">
              Activity
            </span>
          </div>
          {userHabits.map((habit) => (
            <div key={habit} className="text-center min-w-0">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 block truncate">
                {habit}
              </span>
            </div>
          ))}

          {/* Activity rows */}
          {isLoading ? (
            // Loading skeleton for 3 days
            Array.from({ length: 3 }).map((_, index) => (
              <React.Fragment key={`skeleton-${index}`}>
                {/* Day skeleton */}
                <div className="flex items-center justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                {/* Activity text skeleton */}
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Habit status boxes skeleton */}
                {userHabits.map((_, habitIndex) => (
                  <div key={`skeleton-${index}-${habitIndex}`} className="flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded" />
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
