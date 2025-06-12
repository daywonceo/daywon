
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface NutritionCategory {
  id: string;
  name: string;
  emoji: string;
  apiParams: string;
  description: string;
}

interface NutritionCategoryGridProps {
  categories: NutritionCategory[];
  onCategorySelect: (category: NutritionCategory) => void;
}

const NutritionCategoryGrid = ({ categories, onCategorySelect }: NutritionCategoryGridProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
        Nutrition Goals
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800"
            onClick={() => onCategorySelect(category)}
          >
            <CardContent className="p-2 text-center">
              <div className="text-lg mb-1">{category.emoji}</div>
              <h4 className="font-medium text-xs mb-1">{category.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NutritionCategoryGrid;
