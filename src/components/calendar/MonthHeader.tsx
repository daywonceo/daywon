import React from "react";
import { format } from "date-fns";

interface MonthHeaderProps {
  currentMonth: Date;
  onMonthNavigation: (direction: 'prev' | 'next') => void;
  isTransitioning: boolean;
}

const MonthHeader = ({ currentMonth, onMonthNavigation, isTransitioning }: MonthHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => onMonthNavigation('prev')}
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
        onClick={() => onMonthNavigation('next')}
        disabled={isTransitioning}
        className="h-8 w-8 sm:h-9 sm:w-9 bg-secondary hover:bg-secondary/80 p-0 rounded-lg text-secondary-foreground transition-all duration-200 shadow-sm border border-border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default MonthHeader;