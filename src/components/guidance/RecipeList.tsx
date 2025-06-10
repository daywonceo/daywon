
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import RecipeCard from "./RecipeCard";
import SupabaseRecipeCard from "./SupabaseRecipeCard";

interface SupabaseRecipe {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
}

interface LocalRecipe {
  title: string;
  prep: string;
  difficulty: string;
  rating: number;
  ingredients: string[];
  instructions: string;
  category: string;
}

interface RecipeListProps {
  supabaseRecipes: SupabaseRecipe[];
  localRecipes: LocalRecipe[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const RecipeList = ({
  supabaseRecipes,
  localRecipes,
  isLoading,
  error,
  searchQuery
}: RecipeListProps) => {
  const hasNoResults = searchQuery && supabaseRecipes.length === 0 && localRecipes.length === 0 && !isLoading;

  return (
    <div className="grid gap-6">
      {/* Loading State */}
      {isLoading && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300">Loading recipes...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Supabase Recipes */}
      {supabaseRecipes.map((recipe, index) => (
        <SupabaseRecipeCard key={`supabase-${index}`} recipe={recipe} index={index} />
      ))}

      {/* Local Recipes */}
      {localRecipes.map((recipe, index) => (
        <RecipeCard key={`local-${index}`} recipe={recipe} />
      ))}

      {/* No Results Message */}
      {hasNoResults && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              No recipes found for "{searchQuery}". Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecipeList;
