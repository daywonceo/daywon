
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Users, ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeList from "./RecipeList";
import { useRecipeData } from "./useRecipeData";
import NutritionCategoryGrid from "./NutritionCategoryGrid";
import NutritionRecipeResults from "./NutritionRecipeResults";
import SavedRecipesTab from "./SavedRecipesTab";

interface NutritionTabProps {
  searchQuery: string;
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

const nutritionCategories: NutritionCategory[] = [
  {
    id: "vegetarian",
    name: "Vegetarian",
    emoji: "🥬",
    apiParams: "diet=vegetarian",
    description: "Plant-based with dairy and eggs"
  },
  {
    id: "vegan",
    name: "Vegan",
    emoji: "🌱",
    apiParams: "diet=vegan",
    description: "100% plant-based"
  },
  {
    id: "gluten-free",
    name: "Gluten-Free",
    emoji: "🌾",
    apiParams: "intolerances=gluten",
    description: "No wheat, barley, or rye"
  },
  {
    id: "dairy-free",
    name: "Dairy-Free",
    emoji: "🥛",
    apiParams: "intolerances=dairy",
    description: "No milk or dairy products"
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain",
    emoji: "💪",
    apiParams: "minProtein=30&sort=protein",
    description: "High protein for muscle building"
  },
  {
    id: "keto",
    name: "Keto",
    emoji: "🥑",
    apiParams: "diet=ketogenic",
    description: "Low carb, high fat"
  },
  {
    id: "endurance-fuel",
    name: "Endurance Fuel",
    emoji: "🏃",
    apiParams: "minCarbs=50&sort=calories",
    description: "High carb for sustained energy"
  },
  {
    id: "post-workout",
    name: "Post-Workout Recovery",
    emoji: "🔋",
    apiParams: "minProtein=20&minCarbs=20&sort=healthiness",
    description: "Protein and carbs for recovery"
  },
  {
    id: "low-sugar",
    name: "Low Sugar",
    emoji: "🍯",
    apiParams: "maxSugar=5&sort=healthiness",
    description: "Under 5g sugar per serving"
  },
  {
    id: "gut-friendly",
    name: "Gut Friendly",
    emoji: "🌿",
    apiParams: "tags=low-FODMAP",
    description: "Easy on digestion"
  },
  {
    id: "quick-easy",
    name: "Quick & Easy",
    emoji: "⚡",
    apiParams: "maxReadyTime=20&sort=time",
    description: "Ready in 20 minutes or less"
  },
  {
    id: "meal-prep",
    name: "Meal Prep Friendly",
    emoji: "📦",
    apiParams: "maxIngredients=10",
    description: "Simple ingredients for batch cooking"
  }
];

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [selectedNutritionCategory, setSelectedNutritionCategory] = useState<NutritionCategory | null>(null);
  const [nutritionRecipes, setNutritionRecipes] = useState<RecipeWithNutrition[]>([]);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  
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

  const handleBackToNutrition = () => {
    setShowSavedRecipes(false);
  };

  const filteredLocalRecipes = filterRecipesBySearch(localRecipes, searchQuery);
  const filteredSupabaseRecipes = filterRecipesBySearch(supabaseRecipes, searchQuery);

  // If saved recipes view is active
  if (showSavedRecipes) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
              Saved Recipes
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToNutrition}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Nutrition
          </Button>
        </div>

        <SavedRecipesTab searchQuery={searchQuery} />
      </div>
    );
  }

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

  // Default view with saved recipes button, nutrition categories and regular recipes
  return (
    <div className="animate-fade-in">
      {/* Saved Recipes Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowSavedRecipes(true)}
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
          All Recipes
        </h3>

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
    </div>
  );
};

export default NutritionTab;
