
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = {
  month: string;
};

const Calendar = ({ month }: CalendarProps) => {
  const [currentView, setCurrentView] = useState("calendar"); // calendar or list
  const daysOfWeek = ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
  
  // Generate calendar data for March (31 days)
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Card className="mb-12 border-green-200 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-green-800">THIS MONTH'S OUTLOOK</h2>
          <div className="flex gap-2">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex bg-green-50 rounded-md p-1 text-sm">
              <button 
                className={`px-3 py-1 rounded-md ${currentView === 'calendar' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${currentView === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setCurrentView('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border border-green-200 rounded-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="flex bg-green-50">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 text-center py-2 font-bold text-green-700 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* First row starts with day 1 */}
            {Array.from({ length: 31 }).map((_, index) => {
              const day = index + 1;
              return (
                <div 
                  key={`day-${day}`} 
                  className="aspect-square border-r border-b border-green-100 last:border-r-0 p-1 min-h-[50px] hover:bg-green-50 transition-colors"
                >
                  {day <= 31 && (
                    <div className="h-full">
                      <div className="text-right text-sm font-medium text-green-800">{day}</div>
                      {/* Indicators for activities */}
                      {day <= 3 && (
                        <div className="mt-2 flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mx-0.5"></div>
                          {day >= 2 && <div className="w-2 h-2 rounded-full bg-blue-500 mx-0.5"></div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
