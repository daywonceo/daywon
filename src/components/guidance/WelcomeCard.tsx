
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
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-6 text-center">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
          Welcome to Your Fitness Journey!
        </h3>
        <p className="text-green-600 dark:text-green-300 mb-4">
          Create your first workout plan to start tracking your progress and achieving your fitness goals.
        </p>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={onCreatePlan}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
          <Button 
            onClick={onManualWorkout}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
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
