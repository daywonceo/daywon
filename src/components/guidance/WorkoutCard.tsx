
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Star } from "lucide-react";
import CollapsibleDescription from "./CollapsibleDescription";

interface Workout {
  title: string;
  duration: string;
  difficulty: string;
  rating: number;
  exercises: string[];
  category: string;
  description?: string;
}

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <Card className="glass-card group interactive-glow relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-primary flex items-center group-hover:text-primary/90 transition-colors">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mr-3">
                <Dumbbell className="w-4 h-4" />
              </div>
              {workout.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center bg-muted/50 px-2 py-1 rounded-full text-xs">
                <Clock className="w-3 h-3 mr-1.5" />
                {workout.duration}
              </span>
              <Badge variant="secondary" className="text-xs">{workout.category}</Badge>
              <div className="flex items-center bg-completion-medium/10 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 mr-1 text-completion-medium fill-current" />
                <span className="text-xs font-medium">{workout.rating}</span>
              </div>
            </CardDescription>
          </div>
          <Badge 
            variant={workout.difficulty === "beginner" ? "default" : "secondary"}
            className="animate-fade-in"
          >
            {workout.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {workout.description && (
          <CollapsibleDescription 
            text={workout.description}
            maxLines={2}
            className="mb-4"
          />
        )}
        
        <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
            Exercises ({workout.exercises.length})
          </h4>
          <ul className="space-y-2.5">
            {workout.exercises.slice(0, 3).map((exercise, idx) => (
              <li key={idx} className="flex items-center text-sm group-hover:translate-x-1 transition-transform duration-200" style={{ transitionDelay: `${idx * 50}ms` }}>
                <div className="w-6 h-6 bg-primary/20 rounded-full mr-3 flex-shrink-0 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{exercise}</span>
              </li>
            ))}
            {workout.exercises.length > 3 && (
              <li className="text-xs text-muted-foreground ml-9 bg-primary/5 px-2 py-1 rounded-full inline-block">
                +{workout.exercises.length - 3} more exercises
              </li>
            )}
          </ul>
        </div>
        
        <Button size="lg" className="w-full relative overflow-hidden group/btn">
          <span className="relative z-10 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
            Start Workout
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
