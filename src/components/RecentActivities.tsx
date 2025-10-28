
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
      <CardContent className="px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5">
        <div className="space-y-6">
          {/* Activity rows with dynamic columns */}
          {isLoading ? (
            // Enhanced loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="grid grid-cols-[4rem_repeat(3,4rem)] sm:grid-cols-[5.5rem_repeat(3,5.5rem)] gap-2 sm:gap-3 md:gap-4 items-center justify-center max-w-fit mx-auto">
                {/* Day skeleton */}
                <div className="flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22">
                  <Skeleton className="h-10 w-10 sm:h-14 sm:w-14 rounded-full" />
                </div>
                {/* Habit status boxes skeleton */}
                {userHabits.map((_, habitIndex) => (
                  <div key={`skeleton-${index}-${habitIndex}`} className="flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22">
                    <Skeleton className="h-16 w-16 sm:h-22 sm:w-22 rounded-lg" />
                  </div>
                ))}
              </div>
            ))
          ) : (
            activities.map((activity, activityIndex) => {
              // Check if habits changed from previous row
              const previousActivity = activityIndex > 0 ? activities[activityIndex - 1] : null;
              const habitsChanged = !previousActivity || 
                activity.categories.length !== previousActivity.categories.length ||
                activity.categories.some((habit, idx) => habit !== previousActivity.categories[idx]);
              
              return (
                <div key={activityIndex} className="space-y-2">
                  {/* Show habit labels for first row or when habits change */}
                  {(activityIndex === 0 || habitsChanged) && (
                    <div 
                      className="grid gap-2 sm:gap-3 md:gap-4 items-center justify-center max-w-fit mx-auto"
                      style={{ 
                        gridTemplateColumns: `4rem repeat(${activity.categories.length}, 4rem)` 
                      }}
                    >
                      {/* Date label */}
                      <div className="flex items-end justify-center min-h-[1.5rem]">
                        <span className="text-[10px] sm:text-xs font-semibold text-primary text-center break-words hyphens-auto leading-tight px-0.5">
                          Date
                        </span>
                      </div>
                      {activity.categories.map((habit) => (
                        <div key={habit} className="flex items-end justify-center min-h-[1.5rem]">
                          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/70 dark:text-muted-foreground text-center break-words hyphens-auto leading-tight px-0.5">
                            {habit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Activity row */}
                  <div 
                    className="grid gap-2 sm:gap-3 md:gap-4 items-center justify-center max-w-fit mx-auto"
                    style={{ 
                      gridTemplateColumns: `4rem repeat(${activity.categories.length}, 4rem)` 
                    }}
                  >
                    <HabitActivityRow
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
