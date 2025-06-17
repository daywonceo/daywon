
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";
import { getHabitActivities } from "@/utils/habitActivity";
import { subDays, format } from 'date-fns';
import HabitCard from "@/components/calendar/HabitCard";
import { BookOpenText, Apple, Dumbbell, Wind, Footprints, LucideIcon } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Color = 'green' | 'purple' | 'red' | 'orange' | 'blue';

const habitDetails: { nameContains: string; color: Color; icon: LucideIcon }[] = [
  { nameContains: 'walk', color: 'green', icon: Footprints },
  { nameContains: 'read', color: 'purple', icon: BookOpenText },
  { nameContains: 'devotion', color: 'purple', icon: BookOpenText },
  { nameContains: 'fruit', color: 'red', icon: Apple },
  { nameContains: 'stretch', color: 'orange', icon: Dumbbell },
  { nameContains: 'breathing', color: 'blue', icon: Wind },
  { nameContains: 'workout', color: 'orange', icon: Dumbbell },
];

const defaultDetail = { color: 'green' as Color, icon: Dumbbell };

const getHabitDetails = (habitName: string) => {
  const name = habitName.toLowerCase();
  const found = habitDetails.find(d => name.includes(d.nameContains));
  return found || { ...defaultDetail, color: habitDetails[Math.floor(Math.random() * habitDetails.length)].color };
};

const TOTAL_GRAPH_DAYS = 180;

interface AllTimeHabitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllTimeHabitsModal: React.FC<AllTimeHabitsModalProps> = ({ open, onOpenChange }) => {
  const { habits, isLoading } = useHabits();
  const [allActivities, setAllActivities] = useState(() => getHabitActivities());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const refreshActivities = () => {
    setAllActivities(getHabitActivities());
  };

  const generateActivityData = (habitName: string) => {
    const habitActivities = allActivities.filter(a => a.habitName === habitName && a.status === 'completed');
    const activityDates = new Set(habitActivities.map(a => a.date));

    return Array.from({ length: TOTAL_GRAPH_DAYS }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      return activityDates.has(dateString);
    });
  };

  const categorizedHabits = useMemo(() => {
    if (!habits) return {};
    
    return habits.reduce((acc, habit) => {
      const category = habit.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(habit);
      return acc;
    }, {} as Record<string, typeof habits>);
  }, [habits]);

  const categories = Object.keys(categorizedHabits);
  const filteredHabits = filterCategory 
    ? categorizedHabits[filterCategory] || []
    : habits || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">All-Time Habits</DialogTitle>
          <DialogDescription>
            View all habits you've ever tracked with their complete activity history and progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sticky top-0 bg-white dark:bg-gray-900 z-10 py-2 border-b">
            <Button
              variant={filterCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(null)}
            >
              All ({habits?.length || 0})
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(category)}
                className="flex items-center gap-1"
              >
                {category} ({categorizedHabits[category]?.length || 0})
              </Button>
            ))}
          </div>

          {/* Habits Display */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {filterCategory ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    {filterCategory}
                    <Badge variant="secondary">{categorizedHabits[filterCategory]?.length || 0}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {categorizedHabits[filterCategory]?.map(habit => {
                      const details = getHabitDetails(habit.name);
                      const activityData = generateActivityData(habit.name);
                      const todayString = format(new Date(), 'yyyy-MM-dd');
                      const isCompletedToday = allActivities.some(a => 
                        a.habitName === habit.name && a.date === todayString && a.status === 'completed'
                      );

                      return (
                        <HabitCard 
                          key={habit.id}
                          habit={habit}
                          activityData={activityData}
                          color={details.color}
                          icon={details.icon}
                          isCompletedToday={isCompletedToday}
                          onUpdate={refreshActivities}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                categories.map(category => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      {category}
                      <Badge variant="secondary">{categorizedHabits[category]?.length || 0}</Badge>
                    </h3>
                    <div className="space-y-4">
                      {categorizedHabits[category]?.map(habit => {
                        const details = getHabitDetails(habit.name);
                        const activityData = generateActivityData(habit.name);
                        const todayString = format(new Date(), 'yyyy-MM-dd');
                        const isCompletedToday = allActivities.some(a => 
                          a.habitName === habit.name && a.date === todayString && a.status === 'completed'
                        );

                        return (
                          <HabitCard 
                            key={habit.id}
                            habit={habit}
                            activityData={activityData}
                            color={details.color}
                            icon={details.icon}
                            isCompletedToday={isCompletedToday}
                            onUpdate={refreshActivities}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              
              {filteredHabits.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No habits found</p>
                  <p className="text-sm">Start tracking habits to see them here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllTimeHabitsModal;
