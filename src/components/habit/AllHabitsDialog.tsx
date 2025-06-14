
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits, Habit } from "@/hooks/useHabits";
import { toast } from "@/hooks/use-toast";
import { Plus, Archive, Edit, Trash2, MoreVertical, ArchiveRestore } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "./HabitFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type AllHabitsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AllHabitsDialog: React.FC<AllHabitsDialogProps> = ({ open, onOpenChange }) => {
  const { habits, isLoading, updateHabit, deleteHabit } = useHabits();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const { activeHabits, archivedHabits } = useMemo(() => {
    const active = habits?.filter(h => h.status === 'active') ?? [];
    const archived = habits?.filter(h => h.status === 'archived') ?? [];
    return { activeHabits: active, archivedHabits: archived };
  }, [habits]);

  const handleToggleArchive = async (habit: Habit) => {
    const newStatus = habit.status === 'active' ? 'archived' : 'active';
    try {
      await updateHabit({ id: habit.id, status: newStatus });
      toast({ title: `Habit ${newStatus}!` });
    } catch {
      toast({ title: "Error updating habit", variant: "destructive" });
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      toast({ title: "Habit deleted" });
    } catch {
      toast({ title: "Error deleting habit", variant: "destructive" });
    }
  };

  const openEditForm = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowHabitForm(true);
  };

  const openAddForm = () => {
    setHabitToEdit(null);
    setShowHabitForm(true);
  };

  const HabitItem = ({ habit }: { habit: Habit }) => (
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
          <DropdownMenuItem onClick={() => openEditForm(habit)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleArchive(habit)}>
            {habit.status === 'active' ? (
                <><Archive className="mr-2 h-4 w-4" /><span>Archive</span></>
            ) : (
                <><ArchiveRestore className="mr-2 h-4 w-4" /><span>Unarchive</span></>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDelete(habit.id)} className="text-red-600 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/40">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Manage Your Habits</DialogTitle>
            <DialogDescription>View, create, and organize all of your habits.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6">
            <div className="flex justify-end sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
                <Button onClick={openAddForm}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Habit
                </Button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Habits ({activeHabits.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeHabits.length > 0 ? activeHabits.map(h => <HabitItem key={h.id} habit={h} />) : <p className="text-sm text-gray-500">No active habits. Add one to get started!</p>}
                  </CardContent>
                </Card>
                {archivedHabits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Archived Habits ({archivedHabits.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {archivedHabits.map(h => <HabitItem key={h.id} habit={h} />)}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <HabitFormDialog 
        open={showHabitForm}
        onOpenChange={setShowHabitForm}
        habitToEdit={habitToEdit}
      />
    </>
  );
};

export default AllHabitsDialog;
