
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Heart, Trash2, Clock, Users } from "lucide-react";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

const SavedRecipesTab = () => {
  const { savedRecipes, removeSavedRecipe, isLoading } = useSavedRecipes();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (savedRecipes.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Saved Recipes Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Save recipes from the nutrition tab to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {savedRecipes.map((recipe) => (
        <Card key={recipe.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-green-800 dark:text-green-400 pr-4">
                {recipe.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSavedRecipe(recipe.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.category && (
                <Badge variant="secondary" className="text-xs">
                  {recipe.category}
                </Badge>
              )}
              {recipe.readyInMinutes && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.readyInMinutes} min
                </Badge>
              )}
              {recipe.servings && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {recipe.servings} servings
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {recipe.nutrition && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {recipe.nutrition.calories && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      {Math.round(recipe.nutrition.calories)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">calories</div>
                  </div>
                )}
                {recipe.nutrition.protein && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-semibold text-red-600 dark:text-red-400">
                      {Math.round(recipe.nutrition.protein)}g
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">protein</div>
                  </div>
                )}
                {recipe.nutrition.carbs && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {Math.round(recipe.nutrition.carbs)}g
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">carbs</div>
                  </div>
                )}
                {recipe.nutrition.fat && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {Math.round(recipe.nutrition.fat)}g
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">fat</div>
                  </div>
                )}
              </div>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Ingredients:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <li className="text-gray-500 italic">
                      +{recipe.ingredients.length - 5} more ingredients...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {recipe.instructions_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(recipe.instructions_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRecipesTab;
