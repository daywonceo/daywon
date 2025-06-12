
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavedRecipe {
  id: string;
  recipe_title: string;
  recipe_ingredients: string[];
  recipe_instructions_url?: string;
  recipe_category?: string;
  recipe_nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  recipe_ready_in_minutes?: number;
  recipe_servings?: number;
  is_dessert: boolean;
  saved_at: string;
}

export const useSavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSavedRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view saved recipes');
        return;
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      setError('Failed to load saved recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
      toast({
        title: "Recipe removed",
        description: "Recipe has been removed from your collection",
      });
    } catch (err) {
      console.error('Error deleting recipe:', err);
      toast({
        title: "Error",
        description: "Failed to remove recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  return { savedRecipes, isLoading, error, refetch: fetchSavedRecipes, deleteRecipe };
};
