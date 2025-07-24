import { useState, useEffect } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { getHabitActivitiesV2 } from "@/utils/habitActivityV2";

export const useCalendarLogic = (setDate?: (date: Date | undefined) => void) => {
  // Animation state management
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  // Update current month when date changes externally
  const updateCurrentMonth = (date: Date | undefined) => {
    if (date) {
      setCurrentMonth(startOfMonth(date));
    }
  };

  // Get habit completion count for a specific date using V2 system
  const getHabitCompletionCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const habitActivities = getHabitActivitiesV2();
    
    return habitActivities.filter(activity => 
      activity.date === dateStr && activity.status === 'completed'
    ).length;
  };

  // Custom month navigation with animation
  const handleMonthNavigation = async (direction: 'prev' | 'next') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection(direction === 'prev' ? 'right' : 'left');
    
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newMonth = direction === 'prev' 
      ? subMonths(currentMonth, 1)
      : addMonths(currentMonth, 1);
    
    setCurrentMonth(newMonth);
    
    // Update parent's date state to sync with the new month
    if (setDate) {
      setDate(newMonth);
    }
    
    // Wait for fade in animation
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setIsTransitioning(false);
    setTransitionDirection(null);
  };

  // Get calendar months based on time period
  const getCalendarMonths = (timePeriod: string) => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    
    switch (timePeriod) {
      case "current":
        return [currentMonthStart];
      case "6months":
        // Last 6 months including current
        return Array.from({ length: 6 }, (_, i) => subMonths(currentMonthStart, i)).reverse();
      case "year":
        // Last 12 months including current
        return Array.from({ length: 12 }, (_, i) => subMonths(currentMonthStart, i)).reverse();
      default:
        return [currentMonthStart];
    }
  };

  // Generate the calendar grid for proper alignment
  const generateCalendarGrid = (month: Date) => {
    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(month);
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({
      start: firstDay,
      end: lastDay
    });
    
    // Create a grid starting from the first day of the week
    const startDay = getDay(firstDay); // 0 = Sunday, 1 = Monday, etc.
    const grid = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      grid.push(null);
    }
    
    // Add all days of the month
    daysInMonth.forEach(day => {
      grid.push(day);
    });
    
    return grid;
  };

  return {
    currentMonth,
    isTransitioning,
    transitionDirection,
    updateCurrentMonth,
    getHabitCompletionCount,
    handleMonthNavigation,
    getCalendarMonths,
    generateCalendarGrid
  };
};