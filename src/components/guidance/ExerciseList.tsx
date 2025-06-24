
import React from "react";
import ExerciseCard from "./ExerciseCard";

interface ExerciseListProps {
  workoutPlan: any;
  exerciseLogs: any[];
  onLogExercise: (exercise: any, sets: number, reps: number, weight?: number) => void;
}

const ExerciseList = ({ workoutPlan, exerciseLogs, onLogExercise }: ExerciseListProps) => {
  console.log('ExerciseList - workoutPlan:', workoutPlan);
  console.log('ExerciseList - exerciseLogs:', exerciseLogs);
  
  if (!workoutPlan) {
    console.log('ExerciseList - No workout plan found');
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Loading Exercises...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generating your workout plan, please wait...
        </p>
      </div>
    );
  }

  if (!workoutPlan.exercises || workoutPlan.exercises.length === 0) {
    console.log('ExerciseList - No exercises in workout plan');
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Exercises Ready
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your workout is ready! Start your timer to begin tracking your session. You can still log exercises manually even without a specific exercise list.
        </p>
      </div>
    );
  }

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
