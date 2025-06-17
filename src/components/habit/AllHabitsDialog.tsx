
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits, Habit } from "@/hooks/useHabits";
import { toast } from "@/hooks/use-toast";
import { Plus, RefreshCw, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "./HabitFormDialog";
import HabitAddSheet from "./HabitAddSheet";
import AllTimeHabitsModal from "./AllTimeHabitsModal";
import HabitList from "./HabitList";

type AllHabitsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AllHabitsDialog: React.FC<AllHabitsDialogProps> = ({ open, onOpenChange }) => {
  const { habits, isLoading, updateHabit, deleteHabit, refreshHabits, addHabit } = useHabits();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showAllTimeHabits, setShowAllTimeHabits] = useState(false);
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
    } catch (error) {
      console.error('Error refreshing habits:', error);
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
        category: getHabitCategory(habitName),
        description: null
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Manage Your Habits</DialogTitle>
            <DialogDescription>View, create, and organize all of your habits. Habits you track will automatically appear here as active.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllTimeHabits(true)}
                  className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  All-Time
                </Button>
              </div>
              <HabitAddSheet
                trigger={
                  <Button size="sm" className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    Add Habit
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
                <HabitList
                  title="Active Habits"
                  habits={activeHabits}
                  emptyMessage="No active habits. Add one or start tracking habits to see them here!"
                  onEdit={openEditForm}
                  onToggleArchive={handleToggleArchive}
                  onDelete={handleDelete}
                />
                {archivedHabits.length > 0 && (
                  <HabitList
                    title="Archived Habits"
                    habits={archivedHabits}
                    emptyMessage="No archived habits."
                    onEdit={openEditForm}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDelete}
                  />
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
      <AllTimeHabitsModal
        open={showAllTimeHabits}
        onOpenChange={setShowAllTimeHabits}
      />
    </>
  );
};

export default AllHabitsDialog;
