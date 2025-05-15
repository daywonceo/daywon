import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { format, subMonths } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState("calendar"); // calendar or list
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("current"); // current or history
  const isMobile = useIsMobile();
  
  const daysOfWeek = isMobile 
    ? ["S", "M", "T", "W", "T", "F", "S"] 
    : ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
  
  // Generate calendar data for current month (31 days)
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

  // Generate previous 6 months data
  const getPreviousMonths = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 1; i <= 6; i++) {
      const date = subMonths(today, i);
      months.push({
        name: format(date, "MMMM"),
        year: format(date, "yyyy"),
        daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        firstDayOfWeek: new Date(date.getFullYear(), date.getMonth(), 1).getDay()
      });
    }
    
    return months;
  };
  
  const previousMonths = getPreviousMonths();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View your historical data</p>
        </div>
        
        <Card className="mb-8 sm:mb-12 border-green-200 dark:border-green-800 shadow-md">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">THIS MONTH'S OUTLOOK</h2>
              <div className="flex flex-row justify-between sm:justify-start gap-2">
                <Tabs 
                  defaultValue="current" 
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
          </CardHeader>
          
          <CardContent className="px-2 sm:px-6">
            {activeTab === "current" ? (
              // Current month view - keeps existing functionality
              currentView === 'calendar' ? (
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
              )
            ) : (
              // Historical 6 months view
              <div className="space-y-6">
                {previousMonths.map((monthData, monthIndex) => (
                  <div key={`month-${monthIndex}`} className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900 p-2 font-bold text-green-800 dark:text-green-200 text-center">
                      {monthData.name} {monthData.year}
                    </div>
                    
                    {/* Calendar Header */}
                    <div className="flex bg-green-50 dark:bg-green-900/50">
                      {daysOfWeek.map((day) => (
                        <div key={`${monthIndex}-${day}`} className="flex-1 text-center py-1 font-medium text-green-700 dark:text-green-300 text-xs">
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
                            className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0 p-1 min-h-[40px] hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                          >
                            <div className="h-full">
                              <div className="text-right text-xs font-medium text-green-800 dark:text-green-200">{day}</div>
                              {hasActivity && (
                                <div className="mt-1 flex justify-center">
                                  <div className={`w-1.5 h-1.5 rounded-full ${activityType === "green" ? "bg-green-500" : "bg-blue-500"} mx-0.5`}></div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalendarPage;
