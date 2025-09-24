
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
    <Card className="glass-card border-primary/20 relative overflow-hidden group">
      {/* Animated background elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-700 delay-150"></div>
      
      <CardContent className="p-6 text-center relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          Welcome to Your Fitness Journey!
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Create your first workout plan to start tracking your progress and achieving your fitness goals.
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={onCreatePlan}
            className="relative overflow-hidden group/btn"
          >
            <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
            Create Your First Plan
          </Button>
          <Button 
            onClick={onManualWorkout}
            variant="outline"
            className="group/btn"
          >
            <Dumbbell className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
            Start Manual Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
