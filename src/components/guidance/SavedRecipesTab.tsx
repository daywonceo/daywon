
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, Clock, Users, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

interface SavedRecipesTabProps {
  searchQuery: string;
}

const nutritionCategories = [
  { id: "all", name: "All Categories" },
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "gluten-free", name: "Gluten-Free" },
  { id: "dairy-free", name: "Dairy-Free" },
  { id: "muscle-gain", name: "Muscle Gain" },
  { id: "keto", name: "Keto" },
  { id: "endurance-fuel", name: "Endurance Fuel" },
  { id: "post-workout", name: "Post-Workout Recovery" },
  { id: "low-sugar", name: "Low Sugar" },
  { id: "gut-friendly", name: "Gut Friendly" },
  { id: "quick-easy", name: "Quick & Easy" },
  { id: "meal-prep", name: "Meal Prep Friendly" }
];

const SavedRecipesTab = ({ searchQuery }: SavedRecipesTabProps) => {
  const { savedRecipes, isLoading, error, deleteRecipe } = useSavedRecipes();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const formatNutritionValue = (value: number | undefined, unit: string) => {
    return value ? `${Math.round(value)}${unit}` : 'N/A';
  };

  // Filter recipes based on search query and category
  const filteredRecipes = savedRecipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.recipe_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.recipe_ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = selectedCategory === "all" || 
      recipe.recipe_category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "muscle-gain" && recipe.recipe_category?.toLowerCase().includes("protein")) ||
      (selectedCategory === "endurance-fuel" && recipe.recipe_category?.toLowerCase().includes("carb")) ||
      (selectedCategory === "post-workout" && recipe.recipe_category?.toLowerCase().includes("recovery")) ||
      (selectedCategory === "low-sugar" && recipe.recipe_category?.toLowerCase().includes("sugar")) ||
      (selectedCategory === "gut-friendly" && recipe.recipe_category?.toLowerCase().includes("gut")) ||
      (selectedCategory === "quick-easy" && recipe.recipe_category?.toLowerCase().includes("quick")) ||
      (selectedCategory === "meal-prep" && recipe.recipe_category?.toLowerCase().includes("prep"));

    return matchesSearch && matchesCategory;
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6">
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
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="animate-fade-in">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400 mb-4">
          Your Saved Recipes ({savedRecipes.length})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {nutritionCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {searchQuery && (
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <p>Searching for: "{searchQuery}" • Found {filteredRecipes.length} recipes</p>
          </div>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {savedRecipes.length === 0 
                ? "You haven't saved any recipes yet. Start exploring and save your favorites!"
                : "No recipes match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    {recipe.recipe_title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {recipe.recipe_category && (
                      <Badge variant="secondary">{recipe.recipe_category}</Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRecipe(recipe.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  {recipe.recipe_ready_in_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.recipe_ready_in_minutes} min
                    </div>
                  )}
                  {recipe.recipe_servings && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.recipe_servings} servings
                    </div>
                  )}
                  {recipe.is_dessert && (
                    <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                      Dessert
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nutrition Facts */}
                {recipe.recipe_nutrition && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800 dark:text-green-400">
                      Nutrition Per Serving
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Calories:</span>
                        <div>{formatNutritionValue(recipe.recipe_nutrition.calories, '')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Protein:</span>
                        <div>{formatNutritionValue(recipe.recipe_nutrition.protein, 'g')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Carbs:</span>
                        <div>{formatNutritionValue(recipe.recipe_nutrition.carbs, 'g')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Fat:</span>
                        <div>{formatNutritionValue(recipe.recipe_nutrition.fat, 'g')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Sugar:</span>
                        <div>{formatNutritionValue(recipe.recipe_nutrition.sugar, 'g')}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <ul className="space-y-1">
                    {recipe.recipe_ingredients.slice(0, 5).map((ingredient, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {ingredient}
                      </li>
                    ))}
                    {recipe.recipe_ingredients.length > 5 && (
                      <li className="text-sm text-gray-500 dark:text-gray-400 ml-5">
                        +{recipe.recipe_ingredients.length - 5} more ingredients
                      </li>
                    )}
                  </ul>
                </div>

                {/* Instructions Link */}
                {recipe.recipe_instructions_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(recipe.recipe_instructions_url, '_blank')}
                  >
                    View Full Recipe
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesTab;
