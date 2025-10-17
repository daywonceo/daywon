
import React from "react";
import { format } from "date-fns";
import CalendarGrid from "./CalendarGrid";
import MonthHeader from "./MonthHeader";
import { useCalendarLogic } from "./useCalendarLogic";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onDateClick?: (date: Date) => void;
  timePeriod: string;
}

const CalendarView = ({ date, setDate, onDateClick, timePeriod }: CalendarViewProps) => {
  const {
    currentMonth,
    isTransitioning,
    transitionDirection,
    updateCurrentMonth,
    handleMonthNavigation,
    getCalendarMonths
  } = useCalendarLogic(setDate);

  // Update current month when date changes externally
  React.useEffect(() => {
    updateCurrentMonth(date);
  }, [date, updateCurrentMonth]);

  const handleDayClick = (selectedDate: Date) => {
    setDate(selectedDate);
    onDateClick?.(selectedDate);
  };

  const months = getCalendarMonths(timePeriod);

  if (timePeriod === "current") {
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
            <div className="bg-card rounded-xl p-2 sm:p-4">
              <MonthHeader 
                currentMonth={currentMonth}
                onMonthNavigation={handleMonthNavigation}
                isTransitioning={isTransitioning}
              />
              <CalendarGrid 
                month={currentMonth}
                onDateClick={handleDayClick}
                size="large"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-month view for 6months and year - Mobile Optimized
  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="grid gap-2 sm:gap-4 max-h-none overflow-visible">
        {months.map((month, index) => (
          <div key={index} className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 pb-4 shadow-sm border border-border">
            <h3 className="text-sm sm:text-base font-semibold text-center mb-2 sm:mb-3 text-foreground bg-background rounded-lg py-1.5 sm:py-2 shadow-sm border border-border">
              {format(month, "MMMM yyyy")}
            </h3>
            <CalendarGrid 
              month={month}
              onDateClick={handleDayClick}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
