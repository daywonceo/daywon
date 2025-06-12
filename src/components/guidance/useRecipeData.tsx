
import { useState, useEffect } from "react";
import { healthyRecipes } from "@/data/guidanceData";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseRecipe {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  readyInMinutes?: number;
  servings?: number;
}

export const useRecipeData = () => {
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

  return {
    supabaseRecipes,
    localRecipes: healthyRecipes,
    isLoading,
    error,
    filterRecipesBySearch
  };
};
