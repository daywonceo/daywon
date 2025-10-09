import { useState, useEffect } from "react";
import { getHabitActivities } from "@/utils/habitActivity";
import { calculateStreakForDate } from "@/utils/habitStreaks";
import { useGuidanceActivity } from "@/hooks/useGuidanceActivity";
import { useAppSessions } from "@/hooks/useAppSessions";

interface HabitData {
  name: string;
  habitId: string;
  streak: number;
}

export const useDailySummaryData = (date: Date | null) => {
  const [actualTimeSpent, setActualTimeSpent] = useState<number>(0);
  const [sectionBreakdown, setSectionBreakdown] = useState<Record<string, number>>({});
  
  if (!date) {
    return {
      completedHabits: [],
      failedHabits: [],
      actualTimeSpent: 0,
      sectionBreakdown: {},
      guidanceActivities: [],
      guidanceLoading: false
    };
  }

  const habitActivities = getHabitActivities();
  const dateStr = date.toISOString().split('T')[0];
  
  const completedHabits: HabitData[] = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'completed')
    .map(activity => ({
      name: activity.habitName,
      habitId: activity.habitId,
      streak: calculateStreakForDate(activity.habitId, date)
    }));

  const failedHabits: HabitData[] = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'failed')
    .map(activity => ({
      name: activity.habitName,
      habitId: activity.habitId,
      streak: calculateStreakForDate(activity.habitId, date)
    }));

  const { getSessionForDate } = useAppSessions();
  const { activities: guidanceActivities, loading: guidanceLoading } = useGuidanceActivity(dateStr);
  
  useEffect(() => {
    const getSessionData = async () => {
      if (!date) return;
      
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

  return {
    completedHabits,
    failedHabits,
    actualTimeSpent,
    sectionBreakdown,
    guidanceActivities,
    guidanceLoading
  };
};
