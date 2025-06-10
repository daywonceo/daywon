
import React, { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import DietCategorySelector from "./DietCategorySelector";
import NutritionGoalSelector from "./NutritionGoalSelector";
import { healthyRecipes } from "@/data/guidanceData";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle } from "lucide-react";

interface SupabaseRecipe {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
}

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [supabaseRecipes, setSupabaseRecipes] = useState<SupabaseRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupabaseRecipes();
  }, []);

  const fetchSupabaseRecipes = async () => {
    console.log('Fetching recipes from Supabase...');
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-recipes');
      
      if (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to fetch recipes from Supabase');
        return;
      }
      
      console.log('Supabase recipes data:', data);
      
      if (data && Array.isArray(data)) {
        setSupabaseRecipes(data);
        console.log(`Successfully loaded ${data.length} recipes from Supabase`);
      } else {
        console.log('No recipes data received or data is not an array:', data);
        setSupabaseRecipes([]);
      }
    } catch (err) {
      console.error('Error calling Supabase function:', err);
      setError('Failed to fetch recipes');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved filtering logic
  const filterRecipesBySearch = (recipes: any[], query: string) => {
    if (!query || query.trim() === "") return recipes;
    
    const searchTerm = query.toLowerCase().trim();
    console.log('Searching for:', searchTerm);
    
    return recipes.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
      const ingredientMatch = recipe.ingredients && recipe.ingredients.some((ingredient: string) => 
        ingredient.toLowerCase().includes(searchTerm)
      );
      
      return titleMatch || ingredientMatch;
    });
  };

  const filteredLocalRecipes = filterRecipesBySearch(healthyRecipes, searchQuery);
  const filteredSupabaseRecipes = filterRecipesBySearch(supabaseRecipes, searchQuery);

  console.log('Search query:', searchQuery);
  console.log('Filtered local recipes:', filteredLocalRecipes.length);
  console.log('Filtered Supabase recipes:', filteredSupabaseRecipes.length);
  console.log('Total Supabase recipes available:', supabaseRecipes.length);

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

      {/* Debug Info */}
      {searchQuery && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <p>Searching for: "{searchQuery}"</p>
          <p>Found {filteredLocalRecipes.length} local recipes and {filteredSupabaseRecipes.length} Supabase recipes</p>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid gap-6">
        {/* Supabase Recipes Section */}
        {isLoading && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <p className="text-center text-gray-600 dark:text-gray-300">Loading recipes...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {filteredSupabaseRecipes.map((recipe, index) => (
          <Card key={`supabase-${index}`} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                    {recipe.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
                    {recipe.is_dessert && (
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Treat - Practice portion control!</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              {recipe.instructions_url && (
                <div>
                  <a 
                    href={recipe.instructions_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Instructions
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Local Recipes */}
        {filteredLocalRecipes.map((recipe, index) => (
          <RecipeCard key={`local-${index}`} recipe={recipe} />
        ))}

        {/* No Results Message */}
        {searchQuery && filteredLocalRecipes.length === 0 && filteredSupabaseRecipes.length === 0 && !isLoading && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <p className="text-center text-gray-600 dark:text-gray-300">
                No recipes found for "{searchQuery}". Try a different search term.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NutritionTab;
