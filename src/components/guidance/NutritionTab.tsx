
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeFilters from "./RecipeFilters";
import RecipeList from "./RecipeList";
import { useRecipeData } from "./useRecipeData";

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
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const formatNutritionValue = (value: number | undefined, unit: string) => {
    return value ? `${Math.round(value)}${unit}` : 'N/A';
  };

  const filteredLocalRecipes = filterRecipesBySearch(localRecipes, searchQuery);
  const filteredSupabaseRecipes = filterRecipesBySearch(supabaseRecipes, searchQuery);

  // If a nutrition category is selected, show those results
  if (selectedNutritionCategory) {
    return (
      <div className="animate-fade-in">
        {/* Selected Category Header */}
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
            onClick={() => {
              setSelectedNutritionCategory(null);
              setNutritionRecipes([]);
              setNutritionError(null);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Loading State */}
        {isLoadingNutrition && (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {nutritionError && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400 text-center">{nutritionError}</p>
            </CardContent>
          </Card>
        )}

        {/* Recipe Results */}
        {!isLoadingNutrition && nutritionRecipes.length > 0 && (
          <div className="grid gap-6">
            {nutritionRecipes.map((recipe, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                      <Utensils className="w-5 h-5 mr-2" />
                      {recipe.title}
                    </CardTitle>
                    {recipe.category && (
                      <Badge variant="secondary">{recipe.category}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.readyInMinutes} min
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nutrition Facts */}
                  {recipe.nutrition && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-800 dark:text-green-400">
                        Nutrition Per Serving
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Calories:</span>
                          <div>{formatNutritionValue(recipe.nutrition.calories, '')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Protein:</span>
                          <div>{formatNutritionValue(recipe.nutrition.protein, 'g')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Carbs:</span>
                          <div>{formatNutritionValue(recipe.nutrition.carbs, 'g')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Fat:</span>
                          <div>{formatNutritionValue(recipe.nutrition.fat, 'g')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Sugar:</span>
                          <div>{formatNutritionValue(recipe.nutrition.sugar, 'g')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {ingredient}
                        </li>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <li className="text-sm text-gray-500 dark:text-gray-400 ml-5">
                          +{recipe.ingredients.length - 5} more ingredients
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Instructions Link */}
                  {recipe.instructions_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(recipe.instructions_url, '_blank')}
                    >
                      View Full Recipe
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoadingNutrition && nutritionRecipes.length === 0 && !nutritionError && selectedNutritionCategory && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No recipes found for {selectedNutritionCategory.name}. Try another category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default view with nutrition categories and regular recipes
  return (
    <div className="animate-fade-in">
      {/* Nutrition Goals Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          Nutrition Goals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nutritionCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800"
              onClick={() => fetchRecipesByCategory(category)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">{category.emoji}</div>
                <h4 className="font-medium text-xs mb-1">{category.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Regular Recipe Section */}
      <div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          All Recipes
        </h3>
        
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
    </div>
  );
};

export default NutritionTab;
