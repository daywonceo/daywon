import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Calendar, Plus, RefreshCw, History, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHabits, Habit } from "@/hooks/useHabits";
import { useHabitDeduplication } from "@/hooks/useHabitDeduplication";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "@/components/habit/HabitFormDialog";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import AllTimeHabitsModal from "@/components/habit/AllTimeHabitsModal";
import { capitalizeHabitName } from "@/lib/utils";
import { recordHabitActivity, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
import { hapticSuccess } from "@/utils/haptics";
import { Check, Plus as PlusIcon, Flame, Target } from "lucide-react";
import { calculateStreakForDate } from "@/utils/habitTracking";

type FilterPeriod = "today" | "week" | "month";

const AllHabits = () => {
  const navigate = useNavigate();
  const { habits, isLoading, updateHabit, deleteHabit, refreshHabits, addHabit } = useHabits();
  const { duplicateGroups, mergeDuplicateHabits, checkForDuplicate } = useHabitDeduplication();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showAllTimeHabits, setShowAllTimeHabits] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("today");
  const [habitStatuses, setHabitStatuses] = useState<Record<string, boolean>>({});

  // Load habit activities and completion status
  useEffect(() => {
    const loadHabitStatuses = async () => {
      const activities = await loadHabitActivitiesFromDatabase();
      const today = new Date().toISOString().split('T')[0];
      const statuses: Record<string, boolean> = {};
      
      activities.forEach(activity => {
        if (activity.date === today) {
          statuses[activity.habitName] = activity.status === 'completed';
        }
      });
      
      setHabitStatuses(statuses);
    };
    
    loadHabitStatuses();
  }, []);

  // Refresh habits when component mounts
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHabits();
      // Refresh habit statuses as well
      const activities = await loadHabitActivitiesFromDatabase();
      const today = new Date().toISOString().split('T')[0];
      const statuses: Record<string, boolean> = {};
      
      activities.forEach(activity => {
        if (activity.date === today) {
          statuses[activity.habitName] = activity.status === 'completed';
        }
      });
      
      setHabitStatuses(statuses);
    } catch (error) {
      console.error('Error refreshing habits:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMergeDuplicates = async () => {
    setIsMerging(true);
    try {
      const result = await mergeDuplicateHabits();
      if (result.success) {
        toast({ title: result.message });
        await refreshHabits();
      } else {
        toast({ title: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error merging duplicates", variant: "destructive" });
    } finally {
      setIsMerging(false);
    }
  };

  const activeHabits = useMemo(() => {
    return habits?.filter(h => h.status === 'active') ?? [];
  }, [habits]);

  const handleToggleComplete = async (habit: Habit) => {
    const isCurrentlyCompleted = habitStatuses[habit.name] || false;
    const newStatus = isCurrentlyCompleted ? 'empty' : 'completed';
    
    try {
      await recordHabitActivity(habit.name, newStatus, new Date());
      hapticSuccess();
      
      // Update local state
      setHabitStatuses(prev => ({
        ...prev,
        [habit.name]: !isCurrentlyCompleted
      }));
      
      toast({ 
        title: `${capitalizeHabitName(habit.name)} ${newStatus === 'completed' ? 'completed' : 'reset'}!` 
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({ title: "Error updating habit", variant: "destructive" });
    }
  };

  const handleHabitSelected = async (habitName: string) => {
    // Check for duplicates before adding
    const duplicate = checkForDuplicate(habitName);
    if (duplicate) {
      toast({ 
        title: "That habit already exists — try editing the existing one!",
        description: `Found existing habit: "${duplicate.name}"`,
        variant: "destructive" 
      });
      return;
    }

    try {
      await addHabit({
        name: habitName,
        status: "active",
        category: getHabitCategory(habitName),
        description: null
      });
      toast({ title: `${capitalizeHabitName(habitName)} added!` });
      await handleRefresh();
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

  const getStreakForHabit = (habitName: string): number => {
    return calculateStreakForDate(habitName, new Date());
  };

  const getFilteredHabits = () => {
    // For now, we'll show all active habits regardless of filter
    // In the future, you could implement filtering based on completion history
    return activeHabits;
  };

  const openEditForm = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowHabitForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">All Habits</h1>
          </div>
          
          <HabitAddSheet
            trigger={
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Habit
              </Button>
            }
            onHabitSelected={handleHabitSelected}
          />
        </div>

        {/* Filter and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {duplicateGroups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMergeDuplicates}
                disabled={isMerging}
                className="flex items-center gap-1 bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                <Merge className={`h-4 w-4 ${isMerging ? 'animate-spin' : ''}`} />
                Merge {duplicateGroups.length} Duplicates
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllTimeHabits(true)}
              className="flex items-center gap-1"
            >
              <History className="h-4 w-4" />
              All-Time
            </Button>
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicateGroups.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🔍 Duplicate Habits Found
            </h3>
            <p className="text-xs text-yellow-700 mb-3">
              Found {duplicateGroups.length} groups of similar habits that can be merged:
            </p>
            <div className="space-y-2">
              {duplicateGroups.map((group, index) => (
                <div key={index} className="text-xs text-yellow-700">
                  <span className="font-medium">→ </span>
                  {group.habits.map(h => h.name).join(', ')} 
                  <span className="text-yellow-600"> → will become: "{group.preferredName}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : getFilteredHabits().length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Habits</h3>
              <p className="text-gray-500 mb-4">Start tracking habits to see them here!</p>
              <HabitAddSheet
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Habit
                  </Button>
                }
                onHabitSelected={handleHabitSelected}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredHabits().map((habit) => {
              const isCompleted = habitStatuses[habit.name] || false;
              const streak = getStreakForHabit(habit.name);
              
              return (
                <Card 
                  key={habit.id} 
                  className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate">
                          {capitalizeHabitName(habit.name)}
                        </CardTitle>
                        {habit.category && (
                          <p className="text-sm text-gray-500 mt-1">{habit.category}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditForm(habit)}
                        className="flex-shrink-0 p-1 h-8 w-8"
                      >
                        ⚙️
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Indicators */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {streak > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Flame className="h-4 w-4" />
                            <span className="text-sm font-semibold">{streak}</span>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Done!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion Button */}
                    <Button
                      onClick={() => handleToggleComplete(habit)}
                      className={`w-full transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-dashed border-gray-300'
                      }`}
                      size="lg"
                    >
                      {isCompleted ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <HabitFormDialog 
        open={showHabitForm}
        onOpenChange={setShowHabitForm}
        habitToEdit={habitToEdit}
      />
      <AllTimeHabitsModal
        open={showAllTimeHabits}
        onOpenChange={setShowAllTimeHabits}
      />
    </div>
  );
};

export default AllHabits;