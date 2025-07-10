import React from "react";
import CalendarCell from "./CalendarCell";
import { useCalendarLogic } from "./useCalendarLogic";

interface CalendarGridProps {
  month: Date;
  onDateClick: (date: Date) => void;
  size: 'small' | 'large';
}

const CalendarGrid = ({ month, onDateClick, size }: CalendarGridProps) => {
  const { generateCalendarGrid, getHabitCompletionCount } = useCalendarLogic();
  const calendarGrid = generateCalendarGrid(month);

  const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const gridGapClasses = size === 'large' ? "gap-1 sm:gap-2" : "gap-0.5";
  const headerTextClasses = size === 'large' 
    ? "text-muted-foreground text-center font-semibold text-xs sm:text-sm uppercase tracking-wide py-2"
    : "text-muted-foreground text-center font-semibold text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wide py-1";
  const headerMarginClasses = size === 'large' ? "mb-3 sm:mb-4" : "mb-2";

  return (
    <>
      {/* Weekday headers */}
      <div className={`grid grid-cols-7 ${gridGapClasses} ${headerMarginClasses}`}>
        {weekdayLabels.map((day) => (
          <div 
            key={day} 
            className={`${headerTextClasses} ${size === 'small' ? 'w-7 sm:w-8 flex items-center justify-center' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 ${gridGapClasses}`}>
        {calendarGrid.map((dayDate, index) => {
          const habitCount = dayDate ? getHabitCompletionCount(dayDate) : 0;
          const isToday = dayDate ? dayDate.toDateString() === new Date().toDateString() : false;
          
          return (
            <CalendarCell
              key={index}
              dayDate={dayDate}
              onDayClick={onDateClick}
              habitCount={habitCount}
              isToday={isToday}
              size={size}
            />
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid;