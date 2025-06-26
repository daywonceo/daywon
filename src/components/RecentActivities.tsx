
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  } = useHabitActivities(habitList);

  // Listen for habit changes to trigger parent updates
  React.useEffect(() => {
    const handleHabitChange = () => {
      onHabitUpdate?.();
    };

    window.addEventListener('habitStatusChanged', handleHabitChange);
    return () => window.removeEventListener('habitStatusChanged', handleHabitChange);
  }, [onHabitUpdate]);

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
          {activities.map((activity, activityIndex) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
