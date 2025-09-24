
import React from "react";
import { Button } from "@/components/ui/button";
import { Target, Dumbbell, Calendar } from "lucide-react";

interface QuickActionsGridProps {
  workoutPlansCount: number;
  onManagePlans: () => void;
  onManualWorkout: () => void;
  onWeekView: () => void;
}

const QuickActionsGrid = ({ 
  workoutPlansCount, 
  onManagePlans, 
  onManualWorkout, 
  onWeekView 
}: QuickActionsGridProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onManagePlans}
          className="h-16 flex flex-col items-center gap-1 group hover:scale-105 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Target className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
          <span className="text-xs relative z-10">{workoutPlansCount > 0 ? 'Manage Plans' : 'Create Plan'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onManualWorkout}
          className="h-16 flex flex-col items-center gap-1 group hover:scale-105 transition-all duration-300 delay-75 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Dumbbell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
          <span className="text-xs relative z-10">Manual Workout</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onWeekView}
          className="h-16 flex flex-col items-center gap-1 group hover:scale-105 transition-all duration-300 delay-150 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
          <span className="text-xs relative z-10">Week Schedule</span>
        </Button>
      </div>
    </>
  );
};

export default QuickActionsGrid;
