
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
          className="h-16 flex flex-col items-center gap-1"
        >
          <Target className="w-5 h-5" />
          <span className="text-xs">{workoutPlansCount > 0 ? 'Manage Plans' : 'Create Plan'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onManualWorkout}
          className="h-16 flex flex-col items-center gap-1"
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-xs">Manual Workout</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onWeekView}
          className="h-16 flex flex-col items-center gap-1"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Week Schedule</span>
        </Button>
      </div>
    </>
  );
};

export default QuickActionsGrid;
