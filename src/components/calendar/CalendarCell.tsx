import React from "react";
import { Leaf } from "lucide-react";

interface CalendarCellProps {
  dayDate: Date | null;
  onDayClick: (date: Date) => void;
  habitCount: number;
  isToday: boolean;
  size: 'small' | 'large';
}

const CalendarCell = ({ dayDate, onDayClick, habitCount, isToday, size }: CalendarCellProps) => {
  if (!dayDate) {
    // Empty cell for days before the first day of the month
    const cellClasses = size === 'large' 
      ? "h-10 w-10 sm:h-12 sm:w-12" 
      : "h-8 w-7 sm:h-9 sm:w-8";
    return <div className={cellClasses}></div>;
  }

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

  const backgroundColorClass = getHabitBackgroundColor(habitCount);
  const textColorClass = getTextColor(habitCount);
  
  const cellClasses = size === 'large' 
    ? "relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center"
    : "relative h-8 w-7 sm:h-9 sm:w-8 flex items-center justify-center";

  const buttonClasses = size === 'large'
    ? `w-full h-full flex items-center justify-center text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
        isToday 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-3 border-green-500 dark:border-green-400 shadow-lg font-bold ring-2 ring-green-200 dark:ring-green-800' 
          : `${backgroundColorClass} ${textColorClass} border-2 border-green-700 dark:border-green-600 hover:border-green-500 hover:bg-accent/50`
      }`
    : `text-xs sm:text-sm w-full h-full flex items-center justify-center font-medium rounded-md transition-all duration-200 ${
        isToday 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-2 border-green-500 dark:border-green-400 shadow-md font-bold ring-1 ring-green-200 dark:ring-green-800' 
          : `${backgroundColorClass} ${textColorClass} border border-green-700 dark:border-green-600 hover:border-green-500 hover:bg-accent/50`
      }`;

  const leafClasses = size === 'large'
    ? "absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400"
    : "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-600 dark:text-green-400";

  const indicatorClasses = size === 'large'
    ? "absolute bottom-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full shadow-sm animate-pulse"
    : "absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full shadow-sm";

  return (
    <div className={cellClasses}>
      <button 
        onClick={() => onDayClick(dayDate)}
        className={buttonClasses}
      >
        <div className="flex items-center justify-center relative">
          {dayDate.getDate()}
          {isToday && (
            <Leaf className={leafClasses} />
          )}
        </div>
      </button>
      {habitCount > 0 && (
        <div className={indicatorClasses}></div>
      )}
    </div>
  );
};

export default CalendarCell;