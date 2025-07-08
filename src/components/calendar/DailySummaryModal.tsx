
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, Heart, BookOpen, ChefHat, Dumbbell, Calendar, Trophy, Target } from "lucide-react";
import { format } from "date-fns";
import { getHabitActivities } from "@/utils/habitActivity";
import { calculateStreakForDate } from "@/utils/habitStreaks";

interface DailySummaryModalProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

const DailySummaryModal = ({ date, isOpen, onClose }: DailySummaryModalProps) => {
  if (!date) return null;

  // Get real habit data for the selected date
  const habitActivities = getHabitActivities();
  const dateStr = date.toISOString().split('T')[0];
  
  const completedHabits = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'completed')
    .map(activity => ({
      name: activity.habitName,
      streak: calculateStreakForDate(activity.habitName, date)
    }));

  const failedHabits = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'failed')
    .map(activity => ({
      name: activity.habitName,
      streak: calculateStreakForDate(activity.habitName, date)
    }));

  // Calculate estimated time spent (placeholder logic)
  const timeSpentMinutes = completedHabits.length * 15; // Estimate 15 minutes per completed habit

  // Mock guidance activities and saved resources - these would come from actual data sources
  const guidanceActivities = [
    "Completed daily devotion",
    "Saved inspirational verse",
    "Completed workout session"
  ];

  const savedResources = [
    { type: "verse", title: "Daily Verse Reading" },
    { type: "recipe", title: "Healthy Meal Recipe" },
    { type: "workout", title: "Daily Workout" }
  ];

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "verse":
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case "recipe":
        return <ChefHat className="h-4 w-4 text-orange-500" />;
      case "workout":
        return <Dumbbell className="h-4 w-4 text-blue-500" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Summary
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(date)}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habits Completed */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Habits Completed
            </h3>
            {completedHabits.length > 0 ? (
              <div className="space-y-2">
                {completedHabits.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">{habit.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      {habit.streak} day streak
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No habits completed this day</p>
            )}
          </div>

          {/* Failed Habits */}
          {failedHabits.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Habits to Improve
                </h3>
                <div className="space-y-2">
                  {failedHabits.map((habit, index) => (
                    <div key={index} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-sm font-medium">{habit.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Try again tomorrow
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Time Spent */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Estimated Time Spent
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-medium">{timeSpentMinutes} minutes</span>
              <p className="text-xs text-muted-foreground mt-1">Based on completed habits</p>
            </div>
          </div>

          <Separator />

          {/* Guidance Activities */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500" />
              Guidance Activities
            </h3>
            {guidanceActivities.length > 0 ? (
              <div className="space-y-2">
                {guidanceActivities.map((activity, index) => (
                  <div key={index} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    {activity}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No guidance activities this day</p>
            )}
          </div>

          <Separator />

          {/* Saved Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Saved/Completed Resources
            </h3>
            {savedResources.length > 0 ? (
              <div className="space-y-2">
                {savedResources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 bg-accent/50 p-3 rounded-lg border border-border">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm font-medium">{resource.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resources saved this day</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySummaryModal;
