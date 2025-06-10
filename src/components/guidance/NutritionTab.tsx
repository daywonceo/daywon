
import React, { useState } from "react";
import RecipeFilters from "./RecipeFilters";
import RecipeList from "./RecipeList";
import { useRecipeData } from "./useRecipeData";

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { 
    supabaseRecipes, 
    localRecipes, 
    isLoading, 
    error, 
    filterRecipesBySearch 
  } = useRecipeData();

  const filteredLocalRecipes = filterRecipesBySearch(localRecipes, searchQuery);
  const filteredSupabaseRecipes = filterRecipesBySearch(supabaseRecipes, searchQuery);

  console.log('Search query:', searchQuery);
  console.log('Filtered local recipes:', filteredLocalRecipes.length);
  console.log('Filtered Supabase recipes:', filteredSupabaseRecipes.length);
  console.log('Total Supabase recipes available:', supabaseRecipes.length);

  return (
    <div className="animate-fade-in">
      <RecipeFilters
        selectedDiet={selectedDiet}
        selectedCategory={selectedCategory}
        onDietChange={setSelectedDiet}
        onCategoryChange={setSelectedCategory}
      />

      {/* Debug Info */}
      {searchQuery && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <p>Searching for: "{searchQuery}"</p>
          <p>Found {filteredLocalRecipes.length} local recipes and {filteredSupabaseRecipes.length} Supabase recipes</p>
        </div>
      )}

      <RecipeList
        supabaseRecipes={filteredSupabaseRecipes}
        localRecipes={filteredLocalRecipes}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default NutritionTab;
