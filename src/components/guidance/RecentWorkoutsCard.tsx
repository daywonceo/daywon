
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface RecentWorkoutsCardProps {
  recentSessions: any[];
  onWorkoutClick: (session: any) => void;
}

const RecentWorkoutsCard = ({ recentSessions, onWorkoutClick }: RecentWorkoutsCardProps) => {
  if (recentSessions.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSessions.map((session) => (
          <div 
            key={session.id} 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              !session.is_completed 
                ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => onWorkoutClick(session)}
          >
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                {!session.workout_plan_id && (
                  <Badge variant="outline" className="ml-2 text-xs">Manual</Badge>
                )}
                {!session.is_completed && (
                  <Timer className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(session.workout_date).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.duration_minutes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {session.duration_minutes}min
                </div>
              )}
              <Badge variant={session.is_completed ? "default" : "secondary"} 
                     className={!session.is_completed ? "bg-orange-600 text-white" : ""}>
                {session.is_completed ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentWorkoutsCard;
