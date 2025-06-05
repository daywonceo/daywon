
import React from "react";
import { Button } from "@/components/ui/button";
import WorkoutCard from "./WorkoutCard";
import { workoutSuggestions } from "@/data/guidanceData";

interface WorkoutsTabProps {
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  searchQuery: string;
}

const WorkoutsTab = ({ selectedDifficulty, onDifficultyChange, searchQuery }: WorkoutsTabProps) => {
  const filteredWorkouts = workoutSuggestions.filter(workout => 
    (selectedDifficulty === "all" || workout.difficulty === selectedDifficulty) &&
    (searchQuery === "" || workout.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6">
        {["all", "beginner", "intermediate"].map((level) => (
          <Button
            key={level}
            variant={selectedDifficulty === level ? "default" : "outline"}
            size="sm"
            onClick={() => onDifficultyChange(level)}
            className={selectedDifficulty === level ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid gap-6">
        {filteredWorkouts.map((workout, index) => (
          <WorkoutCard key={index} workout={workout} />
        ))}
      </div>
    </div>
  );
};

export default WorkoutsTab;
