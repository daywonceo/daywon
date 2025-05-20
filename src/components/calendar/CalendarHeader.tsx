
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarHeaderProps {
  title: string;
  activeTab: string;
  currentView: string;
  setActiveTab: (value: string) => void;
  setCurrentView: (value: string) => void;
}

const CalendarHeader = ({ 
  title, 
  activeTab, 
  currentView, 
  setActiveTab, 
  setCurrentView 
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">{title}</h2>
      <div className="flex flex-row justify-between sm:justify-start gap-2">
        <Tabs 
          defaultValue={activeTab} 
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="history">Past 6 Months</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 border-green-200 dark:border-green-800">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 border-green-200 dark:border-green-800">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex bg-green-50 dark:bg-green-900 rounded-md p-1 text-xs sm:text-sm">
          <button 
            className={`px-2 sm:px-3 py-1 rounded-md ${currentView === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-2 sm:px-3 py-1 rounded-md ${currentView === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
