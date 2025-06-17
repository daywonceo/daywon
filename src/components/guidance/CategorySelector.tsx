
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", name: "All Categories", emoji: "" },
  { id: "strength", name: "Strength", emoji: "" },
  { id: "hope", name: "Hope", emoji: "" },
  { id: "faith", name: "Faith", emoji: "" },
  { id: "peace", name: "Peace", emoji: "" },
  { id: "courage", name: "Courage", emoji: "" },
  { id: "purpose", name: "Purpose", emoji: "" },
  { id: "comfort", name: "Comfort", emoji: "" },
  { id: "perseverance", name: "Perseverance", emoji: "" },
  { id: "friendship", name: "Friendship", emoji: "" },
  { id: "trust", name: "Trust", emoji: "" },
  { id: "transformation", name: "Transformation", emoji: "" },
  { id: "identity", name: "Identity", emoji: "" }
];

interface CategorySelectorProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategorySelector = ({ currentCategory, onCategoryChange }: CategorySelectorProps) => {
  const currentCategoryData = categories.find(cat => cat.id === currentCategory) || categories[0];

  return (
    <Select value={currentCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{currentCategoryData.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
