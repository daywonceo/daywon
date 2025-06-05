
import React, { useState } from "react";
import RecipeCard from "./RecipeCard";
import DietCategorySelector from "./DietCategorySelector";
import NutritionGoalSelector from "./NutritionGoalSelector";
import { healthyRecipes } from "@/data/guidanceData";

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("high-protein");

  const filteredLocalRecipes = healthyRecipes.filter(recipe => 
    searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <DietCategorySelector 
          currentCategory={selectedDiet}
          onCategoryChange={setSelectedDiet}
        />
        
        <NutritionGoalSelector
          currentGoal={selectedCategory}
          onGoalChange={setSelectedCategory}
        />
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-6">
        {filteredLocalRecipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default NutritionTab;
