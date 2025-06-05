
import React from "react";
import RecipeCard from "./RecipeCard";
import { healthyRecipes } from "@/data/guidanceData";

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const filteredRecipes = healthyRecipes.filter(recipe => 
    searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="grid gap-6">
        {filteredRecipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default NutritionTab;
