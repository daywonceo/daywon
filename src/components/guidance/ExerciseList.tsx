
import React from "react";
import ExerciseCard from "./ExerciseCard";

interface ExerciseListProps {
  workoutPlan: any;
  exerciseLogs: any[];
  onLogExercise: (exercise: any, sets: number, reps: number, weight?: number) => void;
}

const ExerciseList = ({ workoutPlan, exerciseLogs, onLogExercise }: ExerciseListProps) => {
  if (!workoutPlan || !workoutPlan.exercises) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
        Today's Exercises ({workoutPlan.exercises.length})
      </h3>
      {workoutPlan.exercises.map((exercise: any, index: number) => (
        <ExerciseCard
          key={index}
          exercise={exercise}
          onLog={onLogExercise}
          isLogged={exerciseLogs.some(log => log.exercise_name === exercise.name)}
        />
      ))}
    </div>
  );
};

export default ExerciseList;
