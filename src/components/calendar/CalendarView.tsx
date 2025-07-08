
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { getHabitActivities } from "@/utils/habitActivity";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onDateClick?: (date: Date) => void;
  timePeriod: string;
}

const CalendarView = ({ date, setDate, onDateClick, timePeriod }: CalendarViewProps) => {
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
    // Single month view for current month - Mobile Optimized
    return (
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDayClick}
          className="rounded-xl border-0 p-0 w-full"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-2 sm:pt-3 relative items-center text-foreground font-semibold text-lg sm:text-xl mb-4",
            nav_button: "h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-lg shadow-md border-2 border-primary",
            day_today: "bg-accent text-accent-foreground font-semibold rounded-lg border-2 border-primary/50 shadow-sm",
            day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-medium aria-selected:opacity-100 relative cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 border-2 border-border hover:border-accent text-sm sm:text-base",
            head_cell: "text-muted-foreground rounded-md w-10 sm:w-12 font-semibold text-xs sm:text-sm uppercase tracking-wide py-2",
            table: "w-full border-collapse space-y-2",
            head_row: "flex mb-3 sm:mb-4",
            row: "flex w-full mt-1 sm:mt-2 gap-1 sm:gap-2",
          }}
          components={{
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
                    className={`w-full h-full flex items-center justify-center text-sm sm:text-base font-medium rounded-lg transition-all duration-200 ${
                      isToday 
                        ? 'bg-accent text-accent-foreground border-2 border-primary/50 shadow-sm' 
                        : `${backgroundColorClass} ${textColorClass} border-2 border-border hover:border-accent hover:bg-accent/50`
                    }`}
                  >
                    {dayDate.getDate()}
                  </button>
                  {habitCount > 0 && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full shadow-sm"></div>
                  )}
                </div>
              );
            },
          }}
        />
      </div>
    );
  }

  // Multi-month view for 6months and year - Mobile Optimized
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 max-h-80 sm:max-h-96 overflow-y-auto">
        {months.map((month, index) => (
          <div key={index} className="bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-border">
            <h3 className="text-sm sm:text-base font-semibold text-center mb-2 sm:mb-3 text-foreground bg-background rounded-lg py-1.5 sm:py-2 shadow-sm border border-border">
              {format(month, "MMMM yyyy")}
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDayClick}
              month={month}
              className="w-full"
              classNames={{
                months: "flex flex-col",
                month: "space-y-2 w-full",
                caption: "hidden", // Hide caption since we have our own header
                nav: "hidden", // Hide navigation for individual months
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-md border border-primary",
                day_today: "bg-accent text-accent-foreground font-semibold rounded-md border border-primary/50",
                day: "h-7 w-7 sm:h-8 sm:w-8 p-0 font-medium aria-selected:opacity-100 relative cursor-pointer hover:bg-accent/50 rounded-md transition-all duration-200 text-xs sm:text-sm border border-border hover:border-accent",
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
                    <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center">
                      <button 
                        {...props}
                        onClick={() => handleDayClick(dayDate)}
                        className={`text-xs sm:text-sm w-full h-full flex items-center justify-center font-medium rounded-md transition-all duration-200 ${
                          isToday 
                            ? 'bg-accent text-accent-foreground border border-primary/50' 
                            : `${backgroundColorClass} ${textColorClass} border border-border hover:border-accent hover:bg-accent/50`
                        }`}
                      >
                        {dayDate.getDate()}
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
