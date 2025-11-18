import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { getHabitActivities, recordHabitActivity } from "@/utils/habitActivity";
import { calculateStreakForDate } from "@/utils/habitStreaks";
import { getHabitCategories } from "@/utils/habitCategories";
import { useGuidanceActivity } from "@/hooks/useGuidanceActivity";
import { useAppSessions } from "@/hooks/useAppSessions";
import { useUserHabits } from "@/hooks/useUserHabits";
import { toast } from "@/hooks/use-toast";

export interface HabitData {
  name: string;
  habitId: string;
  streak: number;
}

export const useDailySummaryData = (date: Date | null) => {
  const [actualTimeSpent, setActualTimeSpent] = useState<number>(0);
  const [sectionBreakdown, setSectionBreakdown] = useState<Record<string, number>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // ALWAYS call hooks unconditionally at the top level
  const dateStr = date?.toISOString().split('T')[0] || '';
  const { getSessionForDate } = useAppSessions();
  const { activities: guidanceActivities, loading: guidanceLoading } = useGuidanceActivity(dateStr);
  const { userHabits } = useUserHabits();
  
  // Calculate habit data using useMemo to avoid recreating on every render
  const { completedHabits, failedHabits } = useMemo(() => {
    if (!date) {
      return {
        completedHabits: [],
        failedHabits: []
      };
    }

    const habitActivities = getHabitActivities();
    const dateString = date.toISOString().split('T')[0];
    
    const completed: HabitData[] = habitActivities
      .filter(activity => activity.date === dateString && activity.status === 'completed')
      .map(activity => ({
        name: activity.habitName,
        habitId: activity.habitId,
        streak: calculateStreakForDate(activity.habitId, date)
      }));

    const failed: HabitData[] = habitActivities
      .filter(activity => activity.date === dateString && activity.status === 'failed')
      .map(activity => ({
        name: activity.habitName,
        habitId: activity.habitId,
        streak: calculateStreakForDate(activity.habitId, date)
      }));

    return {
      completedHabits: completed,
      failedHabits: failed
    };
  }, [date, refreshTrigger]);

  const handleToggleHabit = useCallback(async (habitName: string, currentStatus: 'completed' | 'failed', date: Date) => {
    const newStatus = currentStatus === 'completed' ? 'empty' : 'completed';
    
    try {
      await recordHabitActivity(habitName, newStatus, date);
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
        detail: { 
          category: habitName, 
          status: newStatus, 
          date: date.toISOString().split('T')[0] 
        } 
      }));
      
      toast({
        title: newStatus === 'completed' ? "Habit marked complete!" : "Habit unmarked",
        description: habitName,
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error updating habit",
        description: "Could not update your habit. Please try again.",
        variant: "destructive"
      });
    }
  }, []);
  
  // ALWAYS call useEffect unconditionally
  useEffect(() => {
    const getSessionData = async () => {
      if (!date) {
        setActualTimeSpent(0);
        setSectionBreakdown({});
        return;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const stored = localStorage.getItem('appTimeSession');
      
      const today = new Date().toISOString().split('T')[0];
      if (dateStr === today && stored) {
        try {
          const data = JSON.parse(stored);
          if (data.date === today) {
            setActualTimeSpent(Math.round(data.totalTime || 0));
            setSectionBreakdown(data.sections || {});
            return;
          }
        } catch (error) {
          console.error('Error parsing stored session data:', error);
        }
      }
      
      try {
        const sessionData = await getSessionForDate(dateStr);
        if (sessionData) {
          setActualTimeSpent(sessionData.total_time_minutes);
          setSectionBreakdown(sessionData.section_breakdown as Record<string, number> || {});
        } else {
          const estimatedTime = completedHabits.length * 15;
          setActualTimeSpent(estimatedTime);
          setSectionBreakdown({});
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        const estimatedTime = completedHabits.length * 15;
        setActualTimeSpent(estimatedTime);
        setSectionBreakdown({});
      }
    };
    
    getSessionData();
  }, [date, completedHabits.length, getSessionForDate]);

  // Get untracked habits (all default habits that haven't been tracked)
  const untrackedHabits = useMemo(() => {
    if (!date) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const activities = getHabitActivities();
    const allHabits = getHabitCategories();
    
    // Get all habits that are not completed or failed on this date
    return allHabits
      .filter(habitName => {
        const activity = activities.find(
          a => a.habitName.toLowerCase() === habitName.toLowerCase() && a.date === dateStr
        );
        return !activity || activity.status === 'empty';
      })
      .map(habitName => {
        // Find the habit ID from activities or user habits
        const existingActivity = activities.find(
          a => a.habitName.toLowerCase() === habitName.toLowerCase()
        );
        const userHabit = userHabits?.find(
          uh => uh.habit?.name.toLowerCase() === habitName.toLowerCase()
        );
        
        return {
          name: habitName,
          habitId: existingActivity?.habitId || userHabit?.habit_id || '',
          streak: 0
        };
      });
  }, [date, userHabits, refreshTrigger]);

  return {
    completedHabits,
    failedHabits,
    untrackedHabits,
    actualTimeSpent,
    sectionBreakdown,
    guidanceActivities,
    guidanceLoading,
    handleToggleHabit
  };
};
