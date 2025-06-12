
export interface NutritionCategory {
  id: string;
  name: string;
  emoji: string;
  apiParams: string;
  description: string;
}

export const nutritionCategories: NutritionCategory[] = [
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
