
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarHeaderProps {
  title: string;
  activeTab: string;
  currentView: string;
  timePeriod: string;
  setActiveTab: (value: string) => void;
  setCurrentView: (value: string) => void;
  setTimePeriod: (value: string) => void;
}

const CalendarHeader = ({ 
  title, 
  timePeriod,
  setTimePeriod
}: CalendarHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200 text-center sm:text-left">{title}</h2>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Time Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-36 h-8 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
