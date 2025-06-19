
import React from "react";
import SocialActivityFeed from "./social/SocialActivityFeed";
import PlaylistRecommendations from "./habit/PlaylistRecommendations";
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
      {/* Social Activity Feed */}
      <SocialActivityFeed 
        activities={activities}
        setActivities={setActivities}
        activeHabit={activeHabit}
        setActiveHabit={setActiveHabit}
        userHabits={userHabits}
        toggleStatus={toggleStatus}
        toggleEditMode={toggleEditMode}
        updateActivityText={updateActivityText}
      />
      
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
