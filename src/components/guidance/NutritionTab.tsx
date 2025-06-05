
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import RecipeCard from "./RecipeCard";
import SpoonacularRecipeCard from "./SpoonacularRecipeCard";
import DietCategorySelector from "./DietCategorySelector";
import { healthyRecipes } from "@/data/guidanceData";
import { useSpoonacularRecipes } from "@/hooks/useSpoonacularRecipes";

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [showApiRecipes, setShowApiRecipes] = useState(false);
  
  const { recipes, isLoading, error, fetchRecipes } = useSpoonacularRecipes(selectedDiet);

  const filteredLocalRecipes = healthyRecipes.filter(recipe => 
    searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiRecipes = recipes.filter(recipe => 
    searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleApiRecipes = () => {
    if (!showApiRecipes && selectedDiet !== "all") {
      fetchRecipes();
    }
    setShowApiRecipes(!showApiRecipes);
  };

  return (
    <div className="animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <DietCategorySelector 
          currentCategory={selectedDiet}
          onCategoryChange={setSelectedDiet}
        />
        
        <Button
          variant={showApiRecipes ? "default" : "outline"}
          onClick={handleToggleApiRecipes}
          disabled={selectedDiet === "all"}
          className={showApiRecipes ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {showApiRecipes ? "Show Local Recipes" : "Discover New Recipes"}
        </Button>
      </div>

      {selectedDiet === "all" && !showApiRecipes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select a diet category to discover new recipes from our API
        </p>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">
            Error loading recipes: {error}
          </p>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid gap-6">
        {showApiRecipes ? (
          <>
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            )}
            {!isLoading && filteredApiRecipes.length === 0 && !error && (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                No recipes found for the selected category.
              </p>
            )}
            {filteredApiRecipes.map((recipe) => (
              <SpoonacularRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </>
        ) : (
          <>
            {filteredLocalRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default NutritionTab;
