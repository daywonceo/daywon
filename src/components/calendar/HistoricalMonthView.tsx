
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthData {
  name: string;
  year: string;
  daysInMonth: number;
  firstDayOfWeek: number;
}

interface HistoricalMonthViewProps {
  monthData: MonthData;
  monthIndex: number;
  daysOfWeek: string[];
}

const HistoricalMonthView = ({ monthData, monthIndex, daysOfWeek }: HistoricalMonthViewProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
      <div className="bg-green-50 dark:bg-green-900 p-1.5 sm:p-2 font-bold text-green-800 dark:text-green-200 text-center text-sm sm:text-base">
        {monthData.name} {monthData.year}
      </div>
      
      {/* Calendar Header */}
      <div className="flex bg-green-50 dark:bg-green-900/50">
        {daysOfWeek.map((day) => (
          <div key={`${monthIndex}-${day}`} className="flex-1 text-center py-0.5 sm:py-1 font-medium text-green-700 dark:text-green-300 text-xs">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for first row */}
        {Array.from({ length: monthData.firstDayOfWeek }).map((_, i) => (
          <div key={`${monthIndex}-empty-${i}`} className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0"></div>
        ))}
        
        {/* Day cells */}
        {Array.from({ length: monthData.daysInMonth }).map((_, index) => {
          const day = index + 1;
          // Generate some random data for demonstration purposes
          const hasActivity = Math.random() > 0.7;
          const activityType = Math.random() > 0.5 ? "green" : "blue";
          
          return (
            <div 
              key={`${monthIndex}-day-${day}`} 
              className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-0.5 sm:p-1 min-h-[32px] sm:min-h-[40px] hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
            >
              <div className="h-full">
                <div className="text-right text-xs font-medium text-green-800 dark:text-green-200">{day}</div>
                {hasActivity && (
                  <div className="mt-0.5 sm:mt-1 flex justify-center">
                    <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${activityType === "green" ? "bg-green-500" : "bg-blue-500"} mx-0.5`}></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoricalMonthView;
