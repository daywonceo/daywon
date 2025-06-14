
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
  "Gratitude Journal"
];

type HabitAddSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitSelected?: (name: string) => void;
};

const HabitAddSheet = ({ open, onOpenChange, onHabitSelected }: HabitAddSheetProps) => {
  const [customHabit, setCustomHabit] = useState("");

  const handleSelect = (habit: string) => {
    if (onHabitSelected) onHabitSelected(habit);
    onOpenChange(false);
  };

  const handleCustomAdd = () => {
    if (customHabit.trim()) {
      if (onHabitSelected) onHabitSelected(customHabit.trim());
      setCustomHabit("");
      onOpenChange(false);
    }
  };

  return (
    <BottomSheet
      trigger={null}
      title="Choose a Habit"
    >
      <div>
        <div className="mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Recommended Habits</h4>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_HABITS.map(habit => (
              <Button
                key={habit}
                className="w-full bg-green-50 text-green-800 hover:bg-green-100"
                variant="outline"
                onClick={() => handleSelect(habit)}
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
            onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
          />
          <Button
            className="w-full bg-blue-600 text-white"
            onClick={handleCustomAdd}
            disabled={!customHabit.trim()}
          >
            Add Custom Habit
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default HabitAddSheet;
