
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
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-primary">
            {completedThisWeek}
          </div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-primary">
            {averageMinutes}
          </div>
          <div className="text-xs text-muted-foreground">Avg Minutes</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-2 sm:col-span-1">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-primary">
            {totalCompletedWorkouts}
          </div>
          <div className="text-xs text-muted-foreground">Total Workouts</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutStatsCards;
