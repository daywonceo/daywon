
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit } from "@/hooks/useHabits";
import HabitItem from "./HabitItem";

interface HabitListProps {
  title: string;
  habits: Habit[];
  emptyMessage: string;
  onEdit: (habit: Habit) => void;
  onToggleArchive: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({
  title,
  habits,
  emptyMessage,
  onEdit,
  onToggleArchive,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({habits.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.length > 0 ? (
          habits.map(habit => (
            <HabitItem 
              key={habit.id} 
              habit={habit}
              onEdit={onEdit}
              onToggleArchive={onToggleArchive}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitList;
