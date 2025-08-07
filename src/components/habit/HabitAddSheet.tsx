
import React, { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";
import { HABIT_TEMPLATES, getHabitTemplatesByCategory } from "@/data/habitTemplates";

const CATEGORIES = ['Physical', 'Mental', 'Professional', 'Financial', 'Relational'] as const;

type HabitAddSheetProps = {
  trigger: React.ReactNode;
  onHabitSelected?: (name: string) => void;
};

const HabitAddSheet = ({ trigger, onHabitSelected }: HabitAddSheetProps) => {
  const [customHabit, setCustomHabit] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelect = (habit: string, close: () => void) => {
    if (onHabitSelected) onHabitSelected(habit);
    close();
  };

  const handleCustomAdd = (close: () => void) => {
    if (customHabit.trim()) {
      if (onHabitSelected) onHabitSelected(customHabit.trim());
      setCustomHabit("");
      close();
    }
  };

  // Render trigger via function-as-children in BottomSheet for flexible closing
  return (
    <BottomSheet
      trigger={trigger}
      title="Choose a Habit"
    >
      {(close: () => void) => (
        <div>
          <div className="mb-4">
            {!selectedCategory ? (
              <>
                <h4 className="font-semibold text-foreground mb-3">Choose a Category</h4>
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORIES.map(category => (
                    <Button
                      key={category}
                      className="w-full justify-start text-left"
                      variant="outline"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category} ({getHabitTemplatesByCategory(category).length} habits)
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{selectedCategory} Habits</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs"
                  >
                    ← Back
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1">
                  {getHabitTemplatesByCategory(selectedCategory).map(habit => (
                    <Button
                      key={habit.id}
                      className="w-full text-xs px-2 py-2 h-auto min-h-[2.5rem] leading-tight"
                      variant="outline"
                      onClick={() => handleSelect(habit.name, close)}
                      tabIndex={0}
                    >
                      {habit.name}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mb-1">
            <h4 className="font-semibold text-foreground mb-1">Or add a custom habit</h4>
            <input
              type="text"
              placeholder="Custom habit"
              className="w-full p-2 border border-border rounded-md mb-2 bg-background text-foreground"
              value={customHabit}
              onChange={e => setCustomHabit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCustomAdd(close)}
            />
            <Button
              className="w-full"
              onClick={() => handleCustomAdd(close)}
              disabled={!customHabit.trim()}
            >
              Add Custom Habit
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

export default HabitAddSheet;
