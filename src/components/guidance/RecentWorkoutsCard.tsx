
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, CheckCircle } from "lucide-react";

interface RecentWorkoutsCardProps {
  recentSessions: any[];
  onWorkoutClick: (session: any) => void;
}

const RecentWorkoutsCard = ({ recentSessions, onWorkoutClick }: RecentWorkoutsCardProps) => {
  if (recentSessions.length === 0) return null;

  const getWorkoutStatus = (session: any) => {
    if (session.is_completed) {
      return { status: 'Completed', color: 'default', icon: CheckCircle };
    }
    
    // Check if workout is truly in progress or just stuck
    const sessionDate = new Date(session.workout_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (sessionDate <= today && !session.is_completed) {
      // If no duration and created more than 5 minutes ago, it might be stuck
      const timeSinceCreation = Date.now() - new Date(session.created_at).getTime();
      if (!session.duration_minutes && timeSinceCreation > 5 * 60 * 1000) {
        return { status: 'Ready to Start', color: 'secondary', icon: Play };
      }
      return { status: 'In Progress', color: 'orange', icon: Timer };
    }
    
    return { status: 'Scheduled', color: 'secondary', icon: Play };
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSessions.map((session) => {
          const { status, color, icon: StatusIcon } = getWorkoutStatus(session);
          
          return (
            <div 
              key={session.id} 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                status === 'In Progress' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                  : status === 'Ready to Start'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
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
                  <StatusIcon className={`w-4 h-4 ${
                    status === 'In Progress' ? 'text-orange-600' : 
                    status === 'Ready to Start' ? 'text-blue-600' : 
                    'text-green-600'
                  }`} />
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
                <Badge 
                  variant={color === 'default' ? "default" : "secondary"} 
                  className={
                    status === 'In Progress' ? "bg-orange-600 text-white" : 
                    status === 'Ready to Start' ? "bg-blue-600 text-white" : ""
                  }
                >
                  {status}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentWorkoutsCard;
