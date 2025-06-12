
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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

const NutritionGoals = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<NutritionCategory | null>(null);
  const [recipes, setRecipes] = useState<RecipeWithNutrition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipesByCategory = async (category: NutritionCategory) => {
    setIsLoading(true);
    setError(null);
    setSelectedCategory(category);

    try {
      console.log(`Fetching ${category.name} recipes with params: ${category.apiParams}`);
      
      const { data, error } = await supabase.functions.invoke('get-nutrition-recipes', {
        body: { categoryParams: category.apiParams }
      });

      if (error) {
        console.error('Error fetching nutrition recipes:', error);
        setError('Failed to fetch recipes');
        return;
      }

      if (data && Array.isArray(data)) {
        setRecipes(data);
        console.log(`Successfully loaded ${data.length} ${category.name} recipes`);
      } else {
        setRecipes([]);
        console.log('No recipes data received');
      }
    } catch (err) {
      console.error('Error calling nutrition recipes function:', err);
      setError('Failed to fetch recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNutritionValue = (value: number | undefined, unit: string) => {
    return value ? `${Math.round(value)}${unit}` : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/guidance')}
            className="text-green-800 dark:text-green-200"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
              Nutrition Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Choose your dietary goal to find matching recipes
            </p>
          </div>
        </div>

        {!selectedCategory ? (
          /* Category Selection Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nutritionCategories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800"
                onClick={() => fetchRecipesByCategory(category)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Recipe Results */
          <div>
            {/* Selected Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedCategory.emoji}</div>
                <div>
                  <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedCategory.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setRecipes([]);
                  setError(null);
                }}
              >
                Back to Categories
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
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
            {error && (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Recipe Results */}
            {!isLoading && recipes.length > 0 && (
              <div className="grid gap-6">
                {recipes.map((recipe, index) => (
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
            {!isLoading && recipes.length === 0 && !error && selectedCategory && (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    No recipes found for {selectedCategory.name}. Try another category.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionGoals;
