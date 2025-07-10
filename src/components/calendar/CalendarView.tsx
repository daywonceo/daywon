
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from "date-fns";
import { getHabitActivities } from "@/utils/habitActivity";
import { Leaf } from "lucide-react";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onDateClick?: (date: Date) => void;
  timePeriod: string;
}

const CalendarView = ({ date, setDate, onDateClick, timePeriod }: CalendarViewProps) => {
  // Animation state management
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  // Update current month when date changes externally
  useEffect(() => {
    if (date) {
      setCurrentMonth(startOfMonth(date));
    }
  }, [date]);

  const handleDayClick = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateClick?.(selectedDate);
    }
  };

  // Get habit completion count for a specific date
  const getHabitCompletionCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const habitActivities = getHabitActivities();
    
    return habitActivities.filter(activity => 
      activity.date === dateStr && activity.status === 'completed'
    ).length;
  };

  // Determine background color based on habit completion count
  const getHabitBackgroundColor = (habitCount: number) => {
    if (habitCount === 0) return '';
    if (habitCount <= 2) return 'bg-green-100 dark:bg-green-900/20';
    if (habitCount <= 4) return 'bg-green-200 dark:bg-green-900/40';
    return 'bg-green-300 dark:bg-green-900/60';
  };

  // Get text color that contrasts well with the background
  const getTextColor = (habitCount: number) => {
    if (habitCount === 0) return '';
    if (habitCount <= 2) return 'text-green-800 dark:text-green-200';
    if (habitCount <= 4) return 'text-green-900 dark:text-green-100';
    return 'text-green-950 dark:text-green-50';
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
    
    // Wait for fade in animation
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setIsTransitioning(false);
    setTransitionDirection(null);
  };

  const getCalendarMonths = () => {
    const today = new Date();
    const currentMonth = startOfMonth(today);
    
    switch (timePeriod) {
      case "current":
        return [currentMonth];
      case "6months":
        // Last 6 months including current
        return Array.from({ length: 6 }, (_, i) => subMonths(currentMonth, i)).reverse();
      case "year":
        // Last 12 months including current
        return Array.from({ length: 12 }, (_, i) => subMonths(currentMonth, i)).reverse();
      default:
        return [currentMonth];
    }
  };

  const months = getCalendarMonths();

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

  if (timePeriod === "current") {
    const calendarGrid = generateCalendarGrid(currentMonth);
    
    // Single month view with custom grid layout
    return (
      <div className="flex justify-center overflow-hidden">
        <div className="relative w-full">
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isTransitioning 
                ? `opacity-0 ${transitionDirection === 'left' ? '-translate-x-8' : 'translate-x-8'} scale-95` 
                : 'opacity-100 translate-x-0 scale-100'
            }`}
          >
            <div className="bg-card rounded-xl p-4 sm:p-6">
              {/* Month header with navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => handleMonthNavigation('prev')}
                  disabled={isTransitioning}
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                
                <button
                  onClick={() => handleMonthNavigation('next')}
                  disabled={isTransitioning}
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div key={day} className="text-muted-foreground text-center font-semibold text-xs sm:text-sm uppercase tracking-wide py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarGrid.map((dayDate, index) => {
                  if (!dayDate) {
                    // Empty cell for days before the first day of the month
                    return <div key={index} className="h-10 w-10 sm:h-12 sm:w-12"></div>;
                  }

                  const habitCount = getHabitCompletionCount(dayDate);
                  const isToday = dayDate.toDateString() === new Date().toDateString();
                  const backgroundColorClass = getHabitBackgroundColor(habitCount);
                  const textColorClass = getTextColor(habitCount);
                  
                  return (
                    <div key={index} className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
                      <button 
                        onClick={() => handleDayClick(dayDate)}
                        className={`w-full h-full flex items-center justify-center text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                          isToday 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-3 border-green-500 dark:border-green-400 shadow-lg font-bold ring-2 ring-green-200 dark:ring-green-800' 
                            : `${backgroundColorClass} ${textColorClass} border-2 border-green-700 dark:border-green-600 hover:border-green-500 hover:bg-accent/50`
                        }`}
                      >
                        <div className="flex items-center justify-center relative">
                          {dayDate.getDate()}
                          {isToday && (
                            <Leaf className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </button>
                      {habitCount > 0 && (
                        <div className="absolute bottom-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full shadow-sm animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-month view for 6months and year - Mobile Optimized
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 max-h-none overflow-visible">
        {months.map((month, index) => {
          const calendarGrid = generateCalendarGrid(month);
          
          return (
            <div key={index} className="bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 pb-6 shadow-sm border border-border">
              <h3 className="text-sm sm:text-base font-semibold text-center mb-2 sm:mb-3 text-foreground bg-background rounded-lg py-1.5 sm:py-2 shadow-sm border border-border">
                {format(month, "MMMM yyyy")}
              </h3>
              
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div key={day} className="text-muted-foreground text-center font-semibold text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wide py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarGrid.map((dayDate, cellIndex) => {
                  if (!dayDate) {
                    // Empty cell for days before the first day of the month
                    return <div key={cellIndex} className="h-8 w-7 sm:h-9 sm:w-8"></div>;
                  }

                  const habitCount = getHabitCompletionCount(dayDate);
                  const isToday = dayDate.toDateString() === new Date().toDateString();
                  const backgroundColorClass = getHabitBackgroundColor(habitCount);
                  const textColorClass = getTextColor(habitCount);
                  
                  return (
                    <div key={cellIndex} className="relative h-8 w-7 sm:h-9 sm:w-8 flex items-center justify-center">
                       <button 
                         onClick={() => handleDayClick(dayDate)}
                         className={`text-xs sm:text-sm w-full h-full flex items-center justify-center font-medium rounded-md transition-all duration-200 ${
                           isToday 
                             ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-2 border-green-500 dark:border-green-400 shadow-md font-bold ring-1 ring-green-200 dark:ring-green-800' 
                             : `${backgroundColorClass} ${textColorClass} border border-green-700 dark:border-green-600 hover:border-green-500 hover:bg-accent/50`
                         }`}
                       >
                         <div className="flex items-center justify-center relative">
                           {dayDate.getDate()}
                           {isToday && (
                             <Leaf className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-600 dark:text-green-400" />
                           )}
                         </div>
                       </button>
                      {habitCount > 0 && (
                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full shadow-sm"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
