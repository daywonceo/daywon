
import React from "react";
import NewWorkoutsTab from "./NewWorkoutsTab";

interface WorkoutsTabProps {
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  searchQuery: string;
}

const WorkoutsTab = ({ selectedDifficulty, onDifficultyChange, searchQuery }: WorkoutsTabProps) => {
  // Use the new workout system
  return <NewWorkoutsTab />;
};

export default WorkoutsTab;
