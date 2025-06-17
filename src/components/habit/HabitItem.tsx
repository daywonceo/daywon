
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Archive, ArchiveRestore, Trash2, MoreVertical } from "lucide-react";
import { Habit } from "@/hooks/useHabits";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HabitItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onToggleArchive: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ 
  habit, 
  onEdit, 
  onToggleArchive, 
  onDelete 
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{habit.name}</p>
        {habit.category && <Badge variant="secondary">{habit.category}</Badge>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(habit)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleArchive(habit)}>
            {habit.status === 'active' ? (
                <><Archive className="mr-2 h-4 w-4" /><span>Archive</span></>
            ) : (
                <><ArchiveRestore className="mr-2 h-4 w-4" /><span>Unarchive</span></>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(habit.id)} 
            className="text-red-600 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/40"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HabitItem;
