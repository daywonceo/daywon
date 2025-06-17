
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from "date-fns";

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

  // Mock function to determine if a date has activity
  const hasActivity = (date: Date) => {
    // This would check your actual data sources
    const today = new Date();
    const daysDiff = Math.abs(today.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7; // Show activity for last 7 days as example
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
    // Single month view for current month
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
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 border-r border-b border-gray-100 dark:border-gray-700",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] border-r border-b border-gray-100 dark:border-gray-700",
            table: "w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-md",
          }}
          components={{
            Day: ({ date: dayDate, ...props }) => {
              const hasActivityToday = hasActivity(dayDate);
              return (
                <div className="relative h-9 w-9 flex items-center justify-center border-r border-b border-gray-100 dark:border-gray-700">
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
  }

  // Multi-month view for 6months and year
  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {months.map((month, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
            <h3 className="text-sm font-semibold text-center mb-2 text-green-800 dark:text-green-200">
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
                day_selected: "bg-green-600 text-primary-foreground hover:bg-green-600/90 focus:bg-green-600",
                day_today: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 relative cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 border-r border-b border-gray-100 dark:border-gray-700 text-xs",
                head_cell: "text-muted-foreground w-8 font-normal text-[0.7rem] border-r border-b border-gray-100 dark:border-gray-700",
                table: "w-full border-collapse border border-gray-200 dark:border-gray-700 rounded",
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const hasActivityToday = hasActivity(dayDate);
                  return (
                    <div className="relative h-8 w-8 flex items-center justify-center border-r border-b border-gray-100 dark:border-gray-700">
                      <button {...props} className="text-xs">
                        {dayDate.getDate()}
                      </button>
                      {hasActivityToday && (
                        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-green-500 rounded-full"></div>
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
