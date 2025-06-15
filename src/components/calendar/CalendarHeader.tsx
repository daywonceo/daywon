
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200 text-center sm:text-left">{title}</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Tabs 
          defaultValue={activeTab} 
          className="w-full sm:w-auto order-1 sm:order-none"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-2 h-8 sm:h-10">
            <TabsTrigger value="current" className="text-xs sm:text-sm">Current</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Past 6 Months</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-center sm:justify-start gap-2 order-2 sm:order-none">
          {activeTab === 'current' && (
            <div className="flex bg-green-50 dark:bg-green-900 rounded-md p-0.5 sm:p-1 text-xs">
              <button 
                className={`px-2 py-1 rounded-md ${currentView === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button 
                className={`px-2 py-1 rounded-md ${currentView === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
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
