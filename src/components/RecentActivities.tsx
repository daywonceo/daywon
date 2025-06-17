
import React from "react";
import { cn } from "@/lib/utils";
import PlaylistRecommendations from "./habit/PlaylistRecommendations";
import HabitGridHeader from "./habit/HabitGridHeader";
import HabitActivityRow from "./habit/HabitActivityRow";
import TodayProgressSummary from "./habit/TodayProgressSummary";
import { useHabitActivities } from "@/hooks/useHabitActivities";

type RecentActivitiesProps = {
  habitList?: string[]; // array of 3 habits to show for this user
};

const RecentActivities = ({ habitList }: RecentActivitiesProps) => {
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

  return (
    <div className="mb-6 sm:mb-16">
      {/* Today's Progress Summary */}
      <TodayProgressSummary />
      
      <div className="flex flex-col overflow-hidden">
        <div
          className={cn(
            "grid",
            // Mobile-first: fixed day, flexible text, fixed habits
            "grid-cols-[30px_1fr_repeat(3,48px)]",
            // Desktop: larger fixed sizes
            "sm:grid-cols-[50px_1fr_repeat(3,64px)]",
            "gap-x-2 sm:gap-x-4 items-center"
          )}
        >
          {/* Grid Header */}
          <HabitGridHeader habits={userHabits} />

          {/* Activity rows */}
          {activities.map((activity, activityIndex) => (
            <React.Fragment key={`activity-${activityIndex}`}>
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
              {activityIndex < activities.length - 1 && (
                <div className="col-span-full h-px bg-green-200/70 dark:bg-gray-700 my-3"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Show playlist recommendations when a habit is active */}
      {activeHabit && (
        <PlaylistRecommendations
          habitName={activeHabit}
          isHabitActive={true}
        />
      )}
    </div>
  );
};

export default RecentActivities;
