
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import HabitGridHeader from "../habit/HabitGridHeader";
import HabitActivityRow from "../habit/HabitActivityRow";
import { DayActivity } from "@/hooks/useHabitActivities";

interface SocialHabitCardProps {
  activities: DayActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  activeHabit: string | null;
  setActiveHabit: React.Dispatch<React.SetStateAction<string | null>>;
  userHabits: string[];
  toggleStatus: (dayIndex: number, category: string) => void;
  toggleEditMode: (dayIndex: number) => void;
  updateActivityText: (dayIndex: number, newText: string) => void;
}

const SocialHabitCard = ({
  activities,
  setActivities,
  activeHabit,
  setActiveHabit,
  userHabits,
  toggleStatus,
  toggleEditMode,
  updateActivityText,
}: SocialHabitCardProps) => {
  return (
    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📅 Track Your Habits
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tap to mark complete or failed
          </p>
        </div>
        
        <div className="overflow-hidden">
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
      </CardContent>
    </Card>
  );
};

export default SocialHabitCard;
