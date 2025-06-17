
import React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onDateClick?: (date: Date) => void;
}

const CalendarView = ({ date, setDate, onDateClick }: CalendarViewProps) => {
  const handleDayClick = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateClick?.(selectedDate);
    }
  };

  // Mock function to determine if a date has activity
  const hasActivity = (date: Date) => {
    // This would check your actual data sources
    const today = new Date();
    const daysDiff = Math.abs(today.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7; // Show activity for last 7 days as example
  };

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDayClick}
        className="rounded-md border border-green-200 dark:border-green-800 p-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-2 relative items-center text-green-800 dark:text-green-200",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-green-800 dark:text-green-200",
          day_selected: "bg-green-600 text-primary-foreground hover:bg-green-600/90 focus:bg-green-600",
          day_today: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20",
        }}
        components={{
          Day: ({ date: dayDate, ...props }) => {
            const hasActivityToday = hasActivity(dayDate);
            return (
              <div className="relative h-9 w-9 flex items-center justify-center">
                <button {...props}>
                  {dayDate.getDate()}
                </button>
                {hasActivityToday && (
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
};

export default CalendarView;
