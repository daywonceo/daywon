
import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { format } from "date-fns";

interface DayCellProps {
  day: number;
  isToday?: boolean;
  isCompact?: boolean;
  onDayClick?: (day: number) => void;
  hasActivities?: boolean;
  activities?: { type: string; text: string }[];
}

const DayCell = ({ 
  day, 
  isToday = false, 
  isCompact = false, 
  onDayClick,
  hasActivities = false,
  activities = [] 
}: DayCellProps) => {
  // For mobile, use drawer; for desktop, use click handler
  const isGreenActivity = day <= 3;
  const isBlueActivity = day >= 2 && day <= 3;
  
  // Mobile view uses drawer
  if (isCompact) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <div 
            className={`aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-1 min-h-[35px] sm:min-h-[50px] active:bg-green-100 dark:active:bg-green-900 transition-colors ${
              isToday ? 'bg-green-50 dark:bg-green-900/50' : ''
            }`}
          >
            <div className="h-full">
              <div className="text-right text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                {day}
              </div>
              {/* Indicators for activities */}
              {isGreenActivity && (
                <div className="mt-1 sm:mt-2 flex justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mx-0.5"></div>
                  {isBlueActivity && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mx-0.5"></div>}
                </div>
              )}
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="px-4 py-6 max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-4">
              {format(new Date(2023, 2, day), "MMMM d, yyyy")}
            </h3>
            <div className="space-y-3">
              <p>Your activities for this day:</p>
              {day <= 3 ? (
                <ul className="space-y-2">
                  <li className="p-2 bg-green-50 dark:bg-green-900/30 rounded">
                    Completed daily workout
                  </li>
                  {day >= 2 && (
                    <li className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                      Italian language practice
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No activities recorded</p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Desktop view uses click handler
  return (
    <div 
      className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-1 min-h-[50px] hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
      onClick={() => onDayClick && onDayClick(day)}
    >
      <div className="h-full">
        <div className="text-right text-sm font-medium text-green-800 dark:text-green-200">{day}</div>
        {isGreenActivity && (
          <div className="mt-2 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-0.5"></div>
            {isBlueActivity && <div className="w-2 h-2 rounded-full bg-blue-500 mx-0.5"></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
