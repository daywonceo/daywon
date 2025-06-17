
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, Heart, BookOpen, ChefHat, Dumbbell } from "lucide-react";
import { format } from "date-fns";

interface DailySummaryModalProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

const DailySummaryModal = ({ date, isOpen, onClose }: DailySummaryModalProps) => {
  if (!date) return null;

  // Mock data - in a real app, this would come from your data sources
  const mockData = {
    habitsCompleted: [
      { name: "Morning Walk", streak: 5 },
      { name: "Reading", streak: 12 },
      { name: "Meditation", streak: 3 }
    ],
    timeSpentMinutes: 45,
    guidanceActivities: [
      "Completed breathing exercise",
      "Answered boredom activity: 'Try a new recipe'"
    ],
    savedResources: [
      { type: "verse", title: "Philippians 4:13" },
      { type: "recipe", title: "Healthy Smoothie Bowl" },
      { type: "workout", title: "Morning Yoga Flow" }
    ]
  };

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
          <DialogTitle className="text-green-800 dark:text-green-200">
            Daily Summary
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(date)}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Habits Completed */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Habits Completed
            </h3>
            {mockData.habitsCompleted.length > 0 ? (
              <div className="space-y-2">
                {mockData.habitsCompleted.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <span className="text-sm">{habit.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {habit.streak} day streak
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No habits completed this day</p>
            )}
          </div>

          <Separator />

          {/* Time Spent */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Time Spent in App
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <span className="text-sm font-medium">{mockData.timeSpentMinutes} minutes</span>
            </div>
          </div>

          <Separator />

          {/* Guidance Activities */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-purple-500" />
              Guidance Activities
            </h3>
            {mockData.guidanceActivities.length > 0 ? (
              <div className="space-y-1">
                {mockData.guidanceActivities.map((activity, index) => (
                  <div key={index} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                    {activity}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No guidance activities this day</p>
            )}
          </div>

          <Separator />

          {/* Saved Resources */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Saved/Completed Resources
            </h3>
            {mockData.savedResources.length > 0 ? (
              <div className="space-y-2">
                {mockData.savedResources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm">{resource.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No resources saved this day</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySummaryModal;
