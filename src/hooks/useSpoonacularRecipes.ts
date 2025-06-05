
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  summary: string;
  sourceUrl: string;
}

interface SpoonacularResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

const API_KEY = 'Xogf6rZLWy7mO51Q88XMhYpznOghHxnn';
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

export const useSpoonacularRecipes = (selectedCategory: string) => {
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (): Promise<SpoonacularResponse> => {
    const url = `${BASE_URL}?number=5&addRecipeNutrition=true&diet=${selectedCategory}&apiKey=${API_KEY}`;
    
    console.log('Fetching recipes from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['spoonacular-recipes', selectedCategory],
    queryFn: fetchRecipes,
    enabled: selectedCategory !== 'all',
    onError: (err: Error) => {
      console.error('Error fetching recipes:', err);
      setError(err.message);
    },
    retry: 2,
  });

  return {
    recipes: data?.results || [],
    isLoading,
    error,
    fetchRecipes: refetch,
    totalResults: data?.totalResults || 0
  };
};
