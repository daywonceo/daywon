
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";

interface WelcomeCardProps {
  onCreatePlan: () => void;
  onManualWorkout: () => void;
}

const WelcomeCard = ({ onCreatePlan, onManualWorkout }: WelcomeCardProps) => {
  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-6 text-center">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Welcome to Your Fitness Journey!
        </h3>
        <p className="text-muted-foreground mb-4">
          Create your first workout plan to start tracking your progress and achieving your fitness goals.
        </p>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={onCreatePlan}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
          <Button 
            onClick={onManualWorkout}
            variant="outline"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Start Manual Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
