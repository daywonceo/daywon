
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Star } from "lucide-react";

interface Workout {
  title: string;
  duration: string;
  difficulty: string;
  rating: number;
  exercises: string[];
  category: string;
}

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
              <Dumbbell className="w-5 h-5 mr-2" />
              {workout.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
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
        <ul className="space-y-2">
          {workout.exercises.map((exercise, idx) => (
            <li key={idx} className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              {exercise}
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
