
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits, Habit } from "@/hooks/useHabits";
import { toast } from "@/hooks/use-toast";
import { Plus, Archive, Edit, Trash2, MoreVertical, ArchiveRestore, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "./HabitFormDialog";
import HabitAddSheet from "./HabitAddSheet";
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
  const { habits, isLoading, updateHabit, deleteHabit, refreshHabits, addHabit } = useHabits();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh habits when dialog opens
  useEffect(() => {
    if (open) {
      handleRefresh();
    }
  }, [open]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHabits();
      toast({ title: "Habits refreshed!" });
    } catch (error) {
      console.error('Error refreshing habits:', error);
      toast({ title: "Error refreshing habits", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const handleHabitSelected = async (habitName: string) => {
    try {
      await addHabit({
        name: habitName,
        status: "active",
        category: getHabitCategory(habitName)
      });
      toast({ title: `${habitName} added!` });
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({ title: "Error adding habit", variant: "destructive" });
    }
  };

  // Get category for default habits
  const getHabitCategory = (habitName: string): string => {
    const categoryMap: Record<string, string> = {
      'Workout': 'Health & Fitness',
      'Devotion': 'Spiritual',
      'Read': 'Personal Development',
      'Sleep 8 Hours': 'Health & Fitness',
      'Drink Water': 'Health & Fitness',
      'Meditate': 'Mindfulness'
    };
    return categoryMap[habitName] || 'Personal';
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
            <DialogDescription>View, create, and organize all of your habits. Habits you track will automatically appear here as active.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6">
            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <HabitAddSheet
                  trigger={
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Habit
                    </Button>
                  }
                  onHabitSelected={handleHabitSelected}
                />
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
                    {activeHabits.length > 0 ? activeHabits.map(h => <HabitItem key={h.id} habit={h} />) : <p className="text-sm text-gray-500">No active habits. Add one or start tracking habits to see them here!</p>}
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
