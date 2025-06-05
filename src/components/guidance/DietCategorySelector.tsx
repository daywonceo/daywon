
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const dietCategories = [
  { id: "all", name: "All Recipes", emoji: "🍽️" },
  { id: "vegetarian", name: "Vegetarian", emoji: "🥬" },
  { id: "vegan", name: "Vegan", emoji: "🌱" },
  { id: "ketogenic", name: "Ketogenic", emoji: "🥑" },
  { id: "paleo", name: "Paleo", emoji: "🥩" },
  { id: "gluten-free", name: "Gluten Free", emoji: "🌾" },
  { id: "dairy-free", name: "Dairy Free", emoji: "🥛" },
  { id: "whole30", name: "Whole30", emoji: "💪" },
];

interface DietCategorySelectorProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

const DietCategorySelector = ({ currentCategory, onCategoryChange }: DietCategorySelectorProps) => {
  const currentCategoryData = dietCategories.find(cat => cat.id === currentCategory) || dietCategories[0];

  return (
    <Select value={currentCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{currentCategoryData.emoji}</span>
            <span>{currentCategoryData.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {dietCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DietCategorySelector;
