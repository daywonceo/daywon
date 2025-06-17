
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, TrendingUp, Target } from "lucide-react";

interface ActivePlanCardProps {
  activePlan: any;
  activeWorkoutSession: any;
  onStartWorkout: () => void;
  onViewProgress: () => void;
  onManagePlans: () => void;
  hasInactivePlans: boolean;
}

const ActivePlanCard = ({ 
  activePlan, 
  activeWorkoutSession, 
  onStartWorkout, 
  onViewProgress, 
  onManagePlans,
  hasInactivePlans
}: ActivePlanCardProps) => {
  if (activePlan) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              {activePlan.name}
            </CardTitle>
            <Badge variant="default" className="bg-green-600">
              Active Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Split: {activePlan.plan_type.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onStartWorkout}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!!activeWorkoutSession}
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeWorkoutSession ? 'Workout In Progress' : 'Start Workout'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onViewProgress}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasInactivePlans) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Active Workout Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have workout plans but none are currently active. Select one to get started.
          </p>
          <Button 
            onClick={onManagePlans}
            className="bg-green-600 hover:bg-green-700"
          >
            <Target className="w-4 h-4 mr-2" />
            Manage Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ActivePlanCard;
