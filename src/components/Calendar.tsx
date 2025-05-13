
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { format } from "date-fns";

type CalendarProps = {
  month: string;
};

const Calendar = ({ month }: CalendarProps) => {
  const [currentView, setCurrentView] = useState("calendar"); // calendar or list
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const daysOfWeek = isMobile 
    ? ["S", "M", "T", "W", "T", "F", "S"] 
    : ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
  
  // Generate calendar data for March (31 days)
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Function to handle day selection
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  // For a more compact mobile view, we'll show fewer weeks at a time
  const getCompactWeekView = () => {
    // Create a 2-week view (14 days) centered around today
    const today = new Date().getDate();
    const startDay = Math.max(1, today - 7);
    const endDay = Math.min(31, today + 6);
    
    return Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);
  };
  
  const compactDays = isMobile ? getCompactWeekView() : calendarDays;

  return (
    <Card className="mb-8 sm:mb-12 border-green-200 dark:border-green-800 shadow-md">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">THIS MONTH'S OUTLOOK</h2>
          <div className="flex flex-row justify-between sm:justify-start gap-2">
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
      </CardHeader>
      
      <CardContent className="px-2 sm:px-6">
        {currentView === 'calendar' ? (
          <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="flex bg-green-50 dark:bg-green-900">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex-1 text-center py-1 sm:py-2 font-bold text-green-700 dark:text-green-300 text-xs sm:text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid - Compact View for Mobile */}
            <div className="grid grid-cols-7">
              {isMobile ? (
                // Compact view
                <>
                  {/* First row - empty cells */}
                  {Array.from({ length: new Date(2023, 2, compactDays[0]).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0"></div>
                  ))}
                  
                  {/* Day cells */}
                  {compactDays.map((day) => (
                    <Drawer key={`day-${day}`}>
                      <DrawerTrigger asChild>
                        <div 
                          className={`aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-1 min-h-[35px] sm:min-h-[50px] active:bg-green-100 dark:active:bg-green-900 transition-colors ${
                            day === new Date().getDate() ? 'bg-green-50 dark:bg-green-900/50' : ''
                          }`}
                        >
                          <div className="h-full">
                            <div className="text-right text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                              {day}
                            </div>
                            {/* Indicators for activities */}
                            {day <= 3 && (
                              <div className="mt-1 sm:mt-2 flex justify-center">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mx-0.5"></div>
                                {day >= 2 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mx-0.5"></div>}
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
                  ))}
                </>
              ) : (
                // Full calendar view for desktop
                Array.from({ length: 31 }).map((_, index) => {
                  const day = index + 1;
                  return (
                    <div 
                      key={`day-${day}`} 
                      className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-1 min-h-[50px] hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="h-full">
                        <div className="text-right text-sm font-medium text-green-800 dark:text-green-200">{day}</div>
                        {day <= 3 && (
                          <div className="mt-2 flex justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mx-0.5"></div>
                            {day >= 2 && <div className="w-2 h-2 rounded-full bg-blue-500 mx-0.5"></div>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // List View
          <div className="space-y-2 py-2">
            {[1, 2, 3].map(day => (
              <div key={`list-${day}`} className="border border-green-100 dark:border-green-800 rounded-lg p-3 flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-green-50 dark:bg-green-900 rounded-full mr-3">
                  <span className="font-bold text-green-800 dark:text-green-200">{day}</span>
                </div>
                <div>
                  {day === 1 && <div>WENT OUT TO DINNER WITH FRIENDS</div>}
                  {day === 2 && <div>HIT A PR ON BENCH IN THE GYM</div>}
                  {day === 3 && <div>PLAYED IN A NEW SOCCER LEAGUE AND WON</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Calendar;
