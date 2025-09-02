import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Calendar, Plus, RefreshCw, History, Merge, List, CheckCircle2, Settings, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useHabits, Habit } from "@/hooks/useHabits";
import { useHabitDeduplication } from "@/hooks/useHabitDeduplication";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "@/components/habit/HabitFormDialog";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import HabitList from "@/components/habit/HabitList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { capitalizeHabitName } from "@/lib/utils";
import { recordHabitActivity, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
import { recordHabitActivityV2 } from "@/utils/habitActivityV2";
import { hapticSuccess } from "@/utils/haptics";
import { Check, Plus as PlusIcon, Flame, Target } from "lucide-react";
import { calculateStreakForDateV2 } from "@/utils/habitTracking";
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type FilterPeriod = "today" | "week" | "month";

interface HabitManagementViewProps {
  open: boolean;
  onClose: () => void;
  userHabits: string[];
}

interface HabitActivity {
  id?: string;
  habit_id?: string;
  habit_name: string;
  activity_date: string;
  status: 'completed' | 'failed' | 'empty';
}

const HabitManagementView = ({ open, onClose, userHabits }: HabitManagementViewProps) => {
  const { user } = useAuth();
  const { habits, isLoading, updateHabit, deleteHabit, endHabit, archiveHabit, unarchiveHabit, refreshHabits, addHabit } = useHabits();
  const { duplicateGroups, mergeDuplicateHabits, checkForDuplicate } = useHabitDeduplication();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("today");
  const [habitStatuses, setHabitStatuses] = useState<Record<string, boolean>>({});
  
  // Catch up specific state
  const [catchUpActivities, setCatchUpActivities] = useState<Record<string, HabitActivity[]>>({});
  const [catchUpLoading, setCatchUpLoading] = useState(false);

  // Delete/Archive dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [deleteAction, setDeleteAction] = useState<'delete' | 'end' | 'archive'>('delete');

  // Generate past 7 days for catch up view
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(startOfDay(new Date()), i);
    return date;
  }).reverse();

  const activeHabits = useMemo(() => {
    return habits?.filter(h => h.status === 'active') ?? [];
  }, [habits]);

  // Load habit activities and completion status for today
  useEffect(() => {
    if (open) {
      loadHabitStatuses();
      loadCatchUpActivities();
    }
  }, [open]);

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

  const loadCatchUpActivities = async () => {
    if (!user) return;
    
    setCatchUpLoading(true);
    try {
      const { data, error } = await supabase
        .from('habit_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', format(past7Days[0], 'yyyy-MM-dd'))
        .lte('activity_date', format(past7Days[past7Days.length - 1], 'yyyy-MM-dd'));

      if (error) throw error;

      // Group activities by date
      const groupedActivities: Record<string, HabitActivity[]> = {};
      
      past7Days.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayActivities = data?.filter(activity => activity.activity_date === dateStr) || [];
        
        // Create entries for all user habits, even if not in database
        const completeActivities = userHabits.map(habitName => {
          // Find existing activity by habit name (case insensitive)
          const existingActivity = dayActivities.find(a => 
            a.habit_name.toLowerCase().trim() === habitName.toLowerCase().trim()
          );
          const habitRecord = habits?.find(h => 
            h.name.toLowerCase().trim() === habitName.toLowerCase().trim()
          );
          
          if (existingActivity) {
            return {
              id: existingActivity.id,
              habit_id: existingActivity.habit_id,
              habit_name: existingActivity.habit_name,
              activity_date: existingActivity.activity_date,
              status: existingActivity.status as 'completed' | 'failed' | 'empty'
            };
          }
          
          return {
            habit_id: habitRecord?.id,
            habit_name: habitName,
            activity_date: dateStr,
            status: 'empty' as const
          };
        });
        
        groupedActivities[dateStr] = completeActivities;
      });
      
      setCatchUpActivities(groupedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error loading data",
        description: "Could not load your habit history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCatchUpLoading(false);
    }
  };

  // Listen for habit status changes from other parts of the app
  useEffect(() => {
    if (!open) return;

    const handleHabitStatusChange = (event: CustomEvent) => {
      const { category, status, date } = event.detail;
      const today = new Date().toISOString().split('T')[0];
      
      // Update today's statuses
      if (date === today) {
        const matchingHabit = habits?.find(habit => 
          habit.name.toUpperCase() === category.toUpperCase() ||
          habit.name.toLowerCase() === category.toLowerCase() ||
          habit.name === category
        );
        
        if (matchingHabit) {
          setHabitStatuses(prev => ({
            ...prev,
            [matchingHabit.name]: status === 'completed'
          }));
        }
      }

      // Update catch up activities
      setCatchUpActivities(prev => ({
        ...prev,
        [date]: prev[date]?.map(activity =>
          activity.habit_name.toLowerCase().trim() === category.toLowerCase().trim()
            ? { ...activity, status }
            : activity
        ) || []
      }));
    };

    window.addEventListener('habitStatusChanged', handleHabitStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('habitStatusChanged', handleHabitStatusChange as EventListener);
    };
  }, [habits, open]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHabits();
      await loadHabitStatuses();
      await loadCatchUpActivities();
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
      
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
        detail: { category: habit.name, status: newStatus, date: new Date().toISOString().split('T')[0] } 
      }));
      
      toast({ 
        title: `${capitalizeHabitName(habit.name)} ${newStatus === 'completed' ? 'completed' : 'reset'}!` 
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({ title: "Error updating habit", variant: "destructive" });
    }
  };

  const toggleCatchUpHabitStatus = async (dateStr: string, habitName: string) => {
    if (!user) return;

    const currentActivity = catchUpActivities[dateStr]?.find(a => 
      a.habit_name.toLowerCase().trim() === habitName.toLowerCase().trim()
    );
    const newStatus = currentActivity?.status === 'completed' ? 'empty' : 'completed';

    try {
      const activityDate = new Date(dateStr + 'T00:00:00');
      await recordHabitActivityV2(habitName, newStatus, activityDate);

      // Update local state optimistically
      setCatchUpActivities(prev => ({
        ...prev,
        [dateStr]: prev[dateStr].map(activity =>
          activity.habit_name.toLowerCase().trim() === habitName.toLowerCase().trim()
            ? { ...activity, status: newStatus }
            : activity
        )
      }));

      // Dispatch event for cross-component synchronization
      window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
        detail: { category: habitName, status: newStatus, date: dateStr } 
      }));

      toast({
        title: newStatus === 'completed' ? "Habit marked complete!" : "Habit unmarked",
        description: `${habitName} for ${format(new Date(dateStr), 'MMM d')}`,
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error updating habit",
        description: "Could not update your habit. Please try again.",
        variant: "destructive"
      });
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
        description: null,
        default_tracking_type: "DAILY"
      });
      toast({ title: `${capitalizeHabitName(habitName)} added!` });
      await handleRefresh();
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({ title: "Error adding habit", variant: "destructive" });
    }
  };

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
    return calculateStreakForDateV2(habitName, new Date());
  };

  const getFilteredHabits = () => {
    return activeHabits;
  };

  const openEditForm = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowHabitForm(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-6xl max-h-[90vh] mx-4 flex flex-col overflow-hidden">{/* Added overflow-hidden */}
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">Manage Habits</CardTitle>
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
          
          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
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
          </div>
          
          {/* Duplicate Warning */}
          {duplicateGroups.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
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
        </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden p-0">{/* Added overflow-hidden */}
          <Tabs defaultValue="today" className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="catchup" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Catch Up
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="today" className="flex-grow overflow-y-auto px-6 mt-4 max-h-[calc(90vh-280px)]">{/* Added max-height */}
              {/* Filter Controls */}
              <div className="flex items-center gap-2 mb-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
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
            </TabsContent>
            
            <TabsContent value="catchup" className="flex-grow overflow-y-auto px-6 mt-4 max-h-[calc(90vh-280px)]">{/* Added max-height */}
              {catchUpLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4 pb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Life gets busy. Let's catch up on the past week together!
                  </p>
                  
                  {past7Days.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayActivities = catchUpActivities[dateStr] || [];
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <div key={dateStr} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-base">
                              {format(date, 'EEEE, MMM d')}
                            </h3>
                            {isToday && (
                              <Badge variant="secondary" className="text-xs">Today</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {dayActivities.filter(a => a.status === 'completed').length}/{dayActivities.length}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dayActivities.map(activity => (
                            <Button
                              key={activity.habit_name}
                              variant={activity.status === 'completed' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleCatchUpHabitStatus(dateStr, activity.habit_name)}
                              className="justify-start h-10"
                            >
                              <CheckCircle2 className={`mr-2 h-4 w-4 ${
                                activity.status === 'completed' ? 'text-white' : 'text-muted-foreground'
                              }`} />
                              {activity.habit_name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manage" className="flex-grow overflow-y-auto px-6 mt-4 max-h-[calc(90vh-280px)]">
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Manage your habits: edit details, archive completed habits, or permanently delete them.
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Active Habits */}
                    <HabitList
                      title="Active Habits"
                      habits={habits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at) || []}
                      emptyMessage="No active habits found. Add a habit to get started!"
                      onEdit={openEditForm}
                      onToggleArchive={(habit) => {
                        setHabitToDelete(habit);
                        setDeleteAction('archive');
                        setShowDeleteDialog(true);
                      }}
                      onDelete={(habitId) => {
                        const habit = habits?.find(h => h.id === habitId);
                        if (habit) {
                          setHabitToDelete(habit);
                          setDeleteAction('delete');
                          setShowDeleteDialog(true);
                        }
                      }}
                    />

                    {/* Archived Habits */}
                    {habits?.some(h => h.archived_at && !h.ended_at) && (
                      <HabitList
                        title="Archived Habits"
                        habits={habits?.filter(h => h.archived_at && !h.ended_at) || []}
                        emptyMessage="No archived habits."
                        onEdit={openEditForm}
                        onToggleArchive={(habit) => {
                          // Unarchive habit
                          unarchiveHabit(habit.id)
                            .then(() => {
                              toast({ title: `${capitalizeHabitName(habit.name)} unarchived!` });
                              refreshHabits();
                            })
                            .catch((error) => {
                              console.error('Error unarchiving habit:', error);
                              toast({ title: "Error unarchiving habit", variant: "destructive" });
                            });
                        }}
                        onDelete={(habitId) => {
                          const habit = habits?.find(h => h.id === habitId);
                          if (habit) {
                            setHabitToDelete(habit);
                            setDeleteAction('delete');
                            setShowDeleteDialog(true);
                          }
                        }}
                      />
                    )}

                    {/* Ended Habits */}
                    {habits?.some(h => h.ended_at) && (
                      <HabitList
                        title="Ended Habits"
                        habits={habits?.filter(h => h.ended_at) || []}
                        emptyMessage="No ended habits."
                        onEdit={openEditForm}
                        onToggleArchive={(habit) => {
                          setHabitToDelete(habit);
                          setDeleteAction('archive');
                          setShowDeleteDialog(true);
                        }}
                        onDelete={(habitId) => {
                          const habit = habits?.find(h => h.id === habitId);
                          if (habit) {
                            setHabitToDelete(habit);
                            setDeleteAction('delete');
                            setShowDeleteDialog(true);
                          }
                        }}
                      />
                    )}

                    {/* Quick Actions */}
                    <Card className="bg-red-50 border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-red-700">
                          Need to stop tracking a habit? Use these options:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const activeHabit = habits?.find(h => h.status === 'active' && !h.ended_at && !h.archived_at);
                              if (activeHabit) {
                                setHabitToDelete(activeHabit);
                                setDeleteAction('end');
                                setShowDeleteDialog(true);
                              } else {
                                toast({ title: "No active habits to end", variant: "destructive" });
                              }
                            }}
                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                          >
                            End a Habit (Keep History)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const activeHabit = habits?.find(h => h.status === 'active' && !h.ended_at && !h.archived_at);
                              if (activeHabit) {
                                setHabitToDelete(activeHabit);
                                setDeleteAction('archive');
                                setShowDeleteDialog(true);
                              } else {
                                toast({ title: "No active habits to archive", variant: "destructive" });
                              }
                            }}
                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                          >
                            Archive a Habit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <HabitFormDialog 
        open={showHabitForm}
        onOpenChange={setShowHabitForm}
        habitToEdit={habitToEdit}
      />

      {/* Delete/Archive/End Habit Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {deleteAction === 'delete' ? 'Delete Habit' : 
               deleteAction === 'end' ? 'End Habit' : 'Archive Habit'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAction === 'delete' ? (
                <>
                  Are you sure you want to permanently delete <strong>{habitToDelete?.name}</strong>? 
                  This will remove all history and cannot be undone.
                </>
              ) : deleteAction === 'end' ? (
                <>
                  Are you sure you want to end <strong>{habitToDelete?.name}</strong>? 
                  This will stop future tracking but keep all your history.
                </>
              ) : (
                <>
                  Are you sure you want to archive <strong>{habitToDelete?.name}</strong>? 
                  You can unarchive it later if needed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setHabitToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!habitToDelete) return;
                
                try {
                  if (deleteAction === 'delete') {
                    await deleteHabit(habitToDelete.id);
                    toast({ title: `${capitalizeHabitName(habitToDelete.name)} deleted permanently.` });
                  } else if (deleteAction === 'end') {
                    await endHabit(habitToDelete.id);
                    toast({ title: `${capitalizeHabitName(habitToDelete.name)} ended. History preserved.` });
                  } else if (deleteAction === 'archive') {
                    await archiveHabit(habitToDelete.id);
                    toast({ title: `${capitalizeHabitName(habitToDelete.name)} archived.` });
                  }
                  
                  await refreshHabits();
                  setShowDeleteDialog(false);
                  setHabitToDelete(null);
                } catch (error) {
                  console.error(`Error ${deleteAction}ing habit:`, error);
                  toast({ 
                    title: `Error ${deleteAction}ing habit`, 
                    variant: "destructive" 
                  });
                }
              }}
              className={deleteAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
                        deleteAction === 'end' ? 'bg-orange-600 hover:bg-orange-700' : 
                        'bg-blue-600 hover:bg-blue-700'}
            >
              {deleteAction === 'delete' ? 'Delete Permanently' : 
               deleteAction === 'end' ? 'End Habit' : 'Archive Habit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HabitManagementView;