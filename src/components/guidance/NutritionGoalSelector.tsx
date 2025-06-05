
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nutritionGoals = [
  { id: "high-protein", name: "High Protein", emoji: "🥩" },
  { id: "high-carb", name: "High Carb", emoji: "🍞" },
  { id: "low-fat", name: "Low Fat", emoji: "🥗" },
];

interface NutritionGoalSelectorProps {
  currentGoal: string;
  onGoalChange: (goal: string) => void;
}

const NutritionGoalSelector = ({ currentGoal, onGoalChange }: NutritionGoalSelectorProps) => {
  const currentGoalData = nutritionGoals.find(goal => goal.id === currentGoal) || nutritionGoals[0];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Nutrition Goal
      </label>
      <Select value={currentGoal} onValueChange={onGoalChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentGoalData.emoji}</span>
              <span>{currentGoalData.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {nutritionGoals.map((goal) => (
            <SelectItem key={goal.id} value={goal.id}>
              <div className="flex items-center gap-2">
                <span>{goal.emoji}</span>
                <span>{goal.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NutritionGoalSelector;
