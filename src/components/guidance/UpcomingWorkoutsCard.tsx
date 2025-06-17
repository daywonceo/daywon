
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface UpcomingWorkoutsCardProps {
  upcomingWorkouts: any[];
}

const UpcomingWorkoutsCard = ({ upcomingWorkouts }: UpcomingWorkoutsCardProps) => {
  if (upcomingWorkouts.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-800 dark:text-orange-400 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingWorkouts.slice(0, 3).map((workout) => (
          <div key={workout.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {workout.workout_type.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(workout.workout_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Planned
            </Badge>
          </div>
        ))}
        {upcomingWorkouts.length > 3 && (
          <p className="text-sm text-gray-500 text-center">
            +{upcomingWorkouts.length - 3} more planned...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingWorkoutsCard;
