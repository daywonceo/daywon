
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
      <Card className="glass-card group hover:scale-105 transition-all duration-300 relative overflow-hidden bg-success/5">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-4 text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Target className="w-6 h-6 mx-auto mb-2 text-success relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-3xl font-bold text-success mb-1 group-hover:text-success/90 transition-colors">
            {completedThisWeek}
          </div>
          <div className="text-xs text-muted-foreground font-medium">This Week</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card group hover:scale-105 transition-all duration-300 delay-75 relative overflow-hidden bg-success/5">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-4 text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Clock className="w-6 h-6 mx-auto mb-2 text-success relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-3xl font-bold text-success mb-1 group-hover:text-success/90 transition-colors">
            {averageMinutes}
          </div>
          <div className="text-xs text-muted-foreground font-medium">Avg Minutes</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card col-span-2 sm:col-span-1 group hover:scale-105 transition-all duration-300 delay-150 relative overflow-hidden bg-success/5">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-4 text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-3xl font-bold text-success mb-1 group-hover:text-success/90 transition-colors">
            {totalCompletedWorkouts}
          </div>
          <div className="text-xs text-muted-foreground font-medium">Total Workouts</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutStatsCards;
