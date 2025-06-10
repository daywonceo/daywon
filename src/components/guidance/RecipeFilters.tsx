
import React from "react";
import DietCategorySelector from "./DietCategorySelector";
import NutritionGoalSelector from "./NutritionGoalSelector";

interface RecipeFiltersProps {
  selectedDiet: string;
  selectedCategory: string;
  onDietChange: (diet: string) => void;
  onCategoryChange: (category: string) => void;
}

const RecipeFilters = ({
  selectedDiet,
  selectedCategory,
  onDietChange,
  onCategoryChange
}: RecipeFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <DietCategorySelector 
        currentCategory={selectedDiet}
        onCategoryChange={onDietChange}
      />
      
      <NutritionGoalSelector
        currentGoal={selectedCategory}
        onGoalChange={onCategoryChange}
      />
    </div>
  );
};

export default RecipeFilters;
