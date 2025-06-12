
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RecipeList from "./RecipeList";
import { useRecipeData } from "./useRecipeData";
import NutritionCategoryGrid from "./NutritionCategoryGrid";
import NutritionRecipeResults from "./NutritionRecipeResults";
import { nutritionCategories } from "./nutritionData";

interface NutritionTabContentProps {
  searchQuery: string;
  onShowSavedRecipes: () => void;
}

interface NutritionCategory {
  id: string;
  name: string;
  emoji: string;
  apiParams: string;
  description: string;
}

interface RecipeWithNutrition {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
  readyInMinutes?: number;
  servings?: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
}

const NutritionTabContent = ({ searchQuery, onShowSavedRecipes }: NutritionTabContentProps) => {
  const [selectedNutritionCategory, setSelectedNutritionCategory] = useState<NutritionCategory | null>(null);
  const [nutritionRecipes, setNutritionRecipes] = useState<RecipeWithNutrition[]>([]);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  
  const { 
    supabaseRecipes, 
    localRecipes, 
    isLoading, 
    error, 
    filterRecipesBySearch 
  } = useRecipeData();

  const fetchRecipesByCategory = async (category: NutritionCategory) => {
    setIsLoadingNutrition(true);
    setNutritionError(null);
    setSelectedNutritionCategory(category);

    try {
      console.log(`Fetching ${category.name} recipes with params: ${category.apiParams}`);
      
      const { data, error } = await supabase.functions.invoke('get-nutrition-recipes', {
        body: { categoryParams: category.apiParams }
      });

      if (error) {
        console.error('Error fetching nutrition recipes:', error);
        setNutritionError('Failed to fetch recipes');
        return;
      }

      if (data && Array.isArray(data)) {
        setNutritionRecipes(data);
        console.log(`Successfully loaded ${data.length} ${category.name} recipes`);
      } else {
        setNutritionRecipes([]);
        console.log('No recipes data received');
      }
    } catch (err) {
      console.error('Error calling nutrition recipes function:', err);
      setNutritionError('Failed to fetch recipes');
    } finally {
      setIsLoadingNutrition(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedNutritionCategory(null);
    setNutritionRecipes([]);
    setNutritionError(null);
  };

  // Filter only Supabase recipes that have nutrition data
  const filteredSupabaseRecipes = filterRecipesBySearch(
    supabaseRecipes.filter(recipe => recipe.nutrition), 
    searchQuery
  );

  // If a nutrition category is selected, show those results
  if (selectedNutritionCategory) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{selectedNutritionCategory.emoji}</div>
            <div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
                {selectedNutritionCategory.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedNutritionCategory.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToCategories}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <NutritionRecipeResults
          recipes={nutritionRecipes}
          isLoading={isLoadingNutrition}
          error={nutritionError}
          categoryName={selectedNutritionCategory.name}
        />
      </div>
    );
  }

  // Default view with saved recipes button, nutrition categories and recipes with nutrition data
  return (
    <div className="animate-fade-in">
      {/* Saved Recipes Button */}
      <div className="mb-6">
        <Button
          onClick={onShowSavedRecipes}
          variant="outline"
          className="w-full bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          <Heart className="w-4 h-4 mr-2" />
          View Saved Recipes
        </Button>
      </div>

      <NutritionCategoryGrid
        categories={nutritionCategories}
        onCategorySelect={fetchRecipesByCategory}
      />

      <div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          Recipes with Nutrition Data
        </h3>

        {searchQuery && (
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <p>Searching for: "{searchQuery}"</p>
            <p>Found {filteredSupabaseRecipes.length} recipes with nutrition data</p>
          </div>
        )}

        <RecipeList
          supabaseRecipes={filteredSupabaseRecipes}
          localRecipes={[]}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default NutritionTabContent;
