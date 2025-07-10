
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from "date-fns";
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

  if (timePeriod === "current") {
    // Single month view with smooth animations
    return (
      <div className="flex justify-center overflow-hidden">
        <div className="relative w-full">
          {/* Custom animated calendar container */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isTransitioning 
                ? `opacity-0 ${transitionDirection === 'left' ? '-translate-x-8' : 'translate-x-8'} scale-95` 
                : 'opacity-100 translate-x-0 scale-100'
            }`}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDayClick}
              month={currentMonth}
              showOutsideDays={false}
              className="rounded-xl border-0 p-0 w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-2 sm:pt-3 relative items-center text-foreground font-semibold text-lg sm:text-xl mb-4",
                nav_button: "h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-lg shadow-md border-2 border-primary",
                day_today: "bg-accent text-accent-foreground font-semibold rounded-lg border-2 border-primary/50 shadow-sm",
                day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-medium aria-selected:opacity-100 relative cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 border-2 border-green-700 dark:border-green-600 hover:border-green-500 text-sm sm:text-base",
                head_cell: "text-muted-foreground rounded-md w-10 sm:w-12 font-semibold text-xs sm:text-sm uppercase tracking-wide py-2",
                table: "w-full border-collapse space-y-2",
                head_row: "flex mb-3 sm:mb-4",
                row: "flex w-full mt-1 sm:mt-2 gap-1 sm:gap-2",
              }}
              components={{
                IconLeft: () => (
                  <button
                    onClick={() => handleMonthNavigation('prev')}
                    disabled={isTransitioning}
                    className="h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ),
                IconRight: () => (
                  <button
                    onClick={() => handleMonthNavigation('next')}
                    disabled={isTransitioning}
                    className="h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ),
                Day: ({ date: dayDate, ...props }) => {
                  const habitCount = getHabitCompletionCount(dayDate);
                  const isToday = dayDate.toDateString() === new Date().toDateString();
                  const backgroundColorClass = getHabitBackgroundColor(habitCount);
                  const textColorClass = getTextColor(habitCount);
                  
                  return (
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
                      <button 
                        {...props}
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
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Multi-month view for 6months and year - Mobile Optimized
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 max-h-none overflow-visible">
        {months.map((month, index) => (
          <div key={index} className="bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 pb-6 shadow-sm border border-border">
            <h3 className="text-sm sm:text-base font-semibold text-center mb-2 sm:mb-3 text-foreground bg-background rounded-lg py-1.5 sm:py-2 shadow-sm border border-border">
              {format(month, "MMMM yyyy")}
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDayClick}
              month={month}
              showOutsideDays={false}
              className="w-full"
              classNames={{
                months: "flex flex-col",
                month: "space-y-2 w-full",
                caption: "hidden", // Hide caption since we have our own header
                nav: "hidden", // Hide navigation for individual months
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-md border border-primary",
                day_today: "bg-accent text-accent-foreground font-semibold rounded-md border border-primary/50",
                day: "h-8 w-7 sm:h-9 sm:w-8 p-0 font-medium aria-selected:opacity-100 relative cursor-pointer hover:bg-accent/50 rounded-md transition-all duration-200 text-xs sm:text-sm border border-green-700 dark:border-green-600 hover:border-green-500",
                head_cell: "text-muted-foreground w-7 sm:w-8 font-semibold text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wide py-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex mb-2",
                row: "flex w-full mt-0.5 gap-0.5",
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const habitCount = getHabitCompletionCount(dayDate);
                  const isToday = dayDate.toDateString() === new Date().toDateString();
                  const backgroundColorClass = getHabitBackgroundColor(habitCount);
                  const textColorClass = getTextColor(habitCount);
                  
                  return (
                    <div className="relative h-8 w-7 sm:h-9 sm:w-8 flex items-center justify-center">
                       <button 
                         {...props}
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
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
