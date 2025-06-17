
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Clock, TrendingUp } from "lucide-react";

interface WorkoutStatsCardsProps {
  completedThisWeek: number;
  averageMinutes: number;
  totalCompletedWorkouts: number;
}

const WorkoutStatsCards = ({ 
  completedThisWeek, 
  averageMinutes, 
  totalCompletedWorkouts 
}: WorkoutStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardContent className="p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-800 dark:text-green-400">
            {completedThisWeek}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">This Week</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardContent className="p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">
            {averageMinutes}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Avg Minutes</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 col-span-2 sm:col-span-1">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-400">
            {totalCompletedWorkouts}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">Total Workouts</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutStatsCards;
