
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTopHabits } from "@/hooks/useTopHabits";
import { toast } from "@/hooks/use-toast";

// An expanded list of possible habits (use or expand this as desired)
const AVAILABLE_HABITS = [
  "Workout", "Read", "Devotion", "Drink Water", "Meditate", "Stretch", "Morning Walk",
  "Gratitude Journal", "Sleep 8 Hours", "Healthy Breakfast", "Focus Work", "No Sugar",
  "Go Outside", "Family Time", "Evening Walk", "Take Vitamins", "Practice Mindfulness",
  "Meal Prep", "Eat Fruits", "Yoga", "Call a Loved One", "No Caffeine After 4pm",
  "Declutter Desk", "Budget Review", "No Social Media Morning", "Journal",
  "20-Minute Cleanup", "Walking after Lunch", "Skincare Routine", "Plan Tomorrow",
  "Daily Reflection"
];

type TopHabitsSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  initialHabits?: string[] | null;
  onSave: (habits: string[]) => void;
};

const TopHabitsSelectorModal: React.FC<TopHabitsSelectorModalProps> = ({
  open,
  onClose,
  initialHabits,
  onSave,
}) => {
  const [selected, setSelected] = useState<string[]>(initialHabits ?? []);
  const [saving, setSaving] = useState(false);

  const toggleHabit = (habit: string) => {
    setSelected(prev => prev.includes(habit)
      ? prev.filter(h => h !== habit)
      : prev.length < 3 ? [...prev, habit] : prev
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected.length !== 3) {
        toast({ title: "Please select 3 habits." });
        setSaving(false);
        return;
      }
      onSave(selected);
      onClose();
      toast({ title: "Top 3 habits set for this month!" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open ? onClose() : undefined}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Top 3 Habits for This Month</DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm">Choose the 3 habits you're focusing on most this month.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
          {AVAILABLE_HABITS.map(habit => (
            <Button
              key={habit}
              variant={selected.includes(habit) ? "secondary" : "outline"}
              className={`w-full py-2 rounded font-medium ${selected.includes(habit) ? "bg-green-600 text-white" : ""}`}
              onClick={() => toggleHabit(habit)}
              disabled={saving}
            >
              {habit}
              {selected.includes(habit) && <span className="ml-2">✔️</span>}
            </Button>
          ))}
        </div>
        <Button className="w-full" onClick={handleSave} disabled={saving || selected.length !== 3}>
          Save Top 3 Habits
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TopHabitsSelectorModal;
