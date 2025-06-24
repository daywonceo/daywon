
import React from "react";
import ExerciseCard from "./ExerciseCard";

interface ExerciseListProps {
  workoutPlan: any;
  exerciseLogs: any[];
  completedExercises: Set<string>;
  onLogExercise: (exercise: any, sets: number, reps: number, weight?: number) => void;
  onToggleExerciseComplete: (exerciseName: string, completed: boolean) => void;
}

const ExerciseList = ({ 
  workoutPlan, 
  exerciseLogs, 
  completedExercises,
  onLogExercise,
  onToggleExerciseComplete 
}: ExerciseListProps) => {
  console.log('ExerciseList - workoutPlan:', workoutPlan);
  console.log('ExerciseList - exerciseLogs:', exerciseLogs);
  console.log('ExerciseList - completedExercises:', completedExercises);
  
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

  const completedCount = workoutPlan.exercises.filter((exercise: any) => 
    completedExercises.has(exercise.name)
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Today's Exercises ({workoutPlan.exercises.length})
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedCount} of {workoutPlan.exercises.length} completed
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / workoutPlan.exercises.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {workoutPlan.exercises.map((exercise: any, index: number) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            onLog={onLogExercise}
            isLogged={exerciseLogs.some(log => log.exercise_name === exercise.name)}
            isCompleted={completedExercises.has(exercise.name)}
            onToggleComplete={onToggleExerciseComplete}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
