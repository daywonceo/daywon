
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
      <Card className="glass-card group relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardHeader className="relative">
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary flex items-center gap-2 group-hover:text-primary/90 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Dumbbell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {activePlan.name}
            </CardTitle>
            <Badge variant="default" className="animate-pulse bg-primary">
              Active Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Split: {activePlan.plan_type.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onStartWorkout}
              size="lg"
              className="flex-1 sm:flex-none relative group/btn px-6"
              disabled={!!activeWorkoutSession}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 flex-shrink-0 group-hover/btn:rotate-90 transition-transform duration-300" />
                <span>{activeWorkoutSession ? 'Workout In Progress' : 'Start Workout'}</span>
              </span>
              {!activeWorkoutSession && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10"></div>
              )}
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={onViewProgress}
              className="group/btn"
            >
              <TrendingUp className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasInactivePlans) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Active Workout Plan
          </h3>
          <p className="text-muted-foreground mb-4">
            You have workout plans but none are currently active. Select one to get started.
          </p>
          <Button 
            onClick={onManagePlans}
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
