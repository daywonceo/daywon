
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
            caption: "flex justify-center pt-1 sm:pt-2 relative items-center text-gray-800 font-semibold text-base sm:text-lg",
            nav_button: "h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 p-0 rounded-lg text-emerald-700 transition-all duration-200 shadow-sm",
            day_selected: "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 focus:from-emerald-600 focus:to-green-600 rounded-lg shadow-md",
            day_today: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-semibold rounded-lg",
            day: "h-8 w-8 sm:h-10 sm:w-10 p-0 font-medium aria-selected:opacity-100 relative cursor-pointer hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-150 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 text-sm sm:text-base",
            head_cell: "text-gray-600 rounded-md w-8 sm:w-10 font-semibold text-xs sm:text-sm uppercase tracking-wide",
            table: "w-full border-collapse space-y-1",
            head_row: "flex mb-1 sm:mb-2",
            row: "flex w-full mt-0.5 sm:mt-1",
          }}
          components={{
            Day: ({ date: dayDate, ...props }) => {
              const hasActivityToday = hasActivity(dayDate);
              return (
                <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                  <button {...props} className="w-full h-full flex items-center justify-center text-sm sm:text-base">
                    {dayDate.getDate()}
                  </button>
                  {hasActivityToday && (
                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-sm"></div>
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
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm sm:text-base font-bold text-center mb-2 sm:mb-3 text-gray-700 bg-white rounded-lg py-1.5 sm:py-2 shadow-sm">
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
                day_selected: "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 focus:from-emerald-600 focus:to-green-600 rounded-md",
                day_today: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-semibold rounded-md",
                day: "h-6 w-6 sm:h-8 sm:w-8 p-0 font-normal aria-selected:opacity-100 relative cursor-pointer hover:bg-white rounded-md transition-all duration-200 text-xs sm:text-xs",
                head_cell: "text-gray-600 w-6 sm:w-8 font-semibold text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wide",
                table: "w-full border-collapse space-y-1",
                head_row: "flex mb-1",
                row: "flex w-full mt-0.5",
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const hasActivityToday = hasActivity(dayDate);
                  return (
                    <div className="relative h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center">
                      <button {...props} className="text-xs w-full h-full flex items-center justify-center">
                        {dayDate.getDate()}
                      </button>
                      {hasActivityToday && (
                        <div className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
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
