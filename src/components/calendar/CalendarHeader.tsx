
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  activeTab, 
  currentView,
  timePeriod,
  setActiveTab, 
  setCurrentView,
  setTimePeriod
}: CalendarHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200 text-center sm:text-left">{title}</h2>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Main tabs for Current vs History */}
        <Tabs 
          defaultValue={activeTab} 
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-2 h-8 sm:h-10">
            <TabsTrigger value="current" className="text-xs sm:text-sm">Current</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Past 6 Months</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Controls section */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
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

          {/* View Toggle (Calendar/List) */}
          {activeTab === 'current' && (
            <div className="flex bg-green-50 dark:bg-green-900 rounded-md p-0.5 text-xs border border-green-200 dark:border-green-700">
              <button 
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  currentView === 'calendar' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-green-800 dark:text-green-200' 
                    : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800'
                }`}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button 
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  currentView === 'list' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-green-800 dark:text-green-200' 
                    : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800'
                }`}
                onClick={() => setCurrentView('list')}
              >
                List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
