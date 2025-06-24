
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
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
              <Dumbbell className="w-5 h-5 mr-2" />
              {workout.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {workout.duration}
              </span>
              <Badge variant="secondary">{workout.category}</Badge>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{workout.rating}</span>
              </div>
            </CardDescription>
          </div>
          <Badge variant={workout.difficulty === "beginner" ? "default" : "secondary"}>
            {workout.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {workout.description && (
          <CollapsibleDescription 
            text={workout.description}
            maxLines={2}
            className="mb-4"
          />
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exercises ({workout.exercises.length})
          </h4>
          <ul className="space-y-2">
            {workout.exercises.slice(0, 3).map((exercise, idx) => (
              <li key={idx} className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-400">{exercise}</span>
              </li>
            ))}
            {workout.exercises.length > 3 && (
              <li className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                +{workout.exercises.length - 3} more exercises
              </li>
            )}
          </ul>
        </div>
        
        <Button className="w-full bg-green-600 hover:bg-green-700">
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
