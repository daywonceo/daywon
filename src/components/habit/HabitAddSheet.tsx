
import React, { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";

const SUGGESTED_HABITS = [
  "Workout",
  "Read",
  "Devotion",
  "Drink Water",
  "Meditate",
  "Stretch",
  "Morning Walk",
  "Gratitude Journal",
  "Sleep 8 Hours",
  "Healthy Breakfast",
  "Focus Work",
  "No Sugar",
  "Go Outside",
  "Family Time",
  "Evening Walk",
  "Take Vitamins",
  "Practice Mindfulness",
  "Meal Prep",
  "Eat Fruits",
  "Yoga",
  "Call a Loved One",
  "No Caffeine After 4pm",
  "Declutter Desk",
  "Budget Review",
  "No Social Media Morning",
  "Journal",
  "20-Minute Cleanup",
  "Walking after Lunch",
  "Skincare Routine",
  "Plan Tomorrow",
  "Daily Reflection"
];

type HabitAddSheetProps = {
  trigger: React.ReactNode;
  onHabitSelected?: (name: string) => void;
};

const HabitAddSheet = ({ trigger, onHabitSelected }: HabitAddSheetProps) => {
  const [customHabit, setCustomHabit] = useState("");

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
            <h4 className="font-semibold text-green-800 mb-2">Recommended Habits</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {SUGGESTED_HABITS.map(habit => (
                <Button
                  key={habit}
                  className="w-full bg-green-50 text-green-800 hover:bg-green-100"
                  variant="outline"
                  onClick={() => handleSelect(habit, close)}
                  tabIndex={0}
                >
                  {habit}
                </Button>
              ))}
            </div>
          </div>
          <div className="mb-1">
            <h4 className="font-semibold text-green-800 mb-1">Or add a custom habit</h4>
            <input
              type="text"
              placeholder="Custom habit"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2"
              value={customHabit}
              onChange={e => setCustomHabit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCustomAdd(close)}
            />
            <Button
              className="w-full bg-blue-600 text-white"
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
