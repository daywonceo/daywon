
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { WorkoutSession } from "@/hooks/useWorkoutSessions";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeekViewCalendarProps {
  plannedWorkouts: WorkoutSession[];
  currentWeekStart: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onWorkoutClick?: (workout: WorkoutSession) => void;
}

const WeekViewCalendar = ({ 
  plannedWorkouts, 
  currentWeekStart, 
  onWeekChange, 
  onWorkoutClick 
}: WeekViewCalendarProps) => {
  const isMobile = useIsMobile();
  const daysOfWeek = isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDateForDay = (dayIndex: number): Date => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    return date;
  };

  const getWorkoutsForDay = (dayIndex: number): WorkoutSession[] => {
    return plannedWorkouts.filter(workout => {
      const workoutDate = new Date(workout.workout_date);
      const dayDate = getDateForDay(dayIndex);
      return workoutDate.toDateString() === dayDate.toDateString();
    });
  };

  const formatWeekRange = (): string => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    
    if (isMobile) {
      if (startMonth === endMonth) {
        return `${startMonth} ${currentWeekStart.getDate()}-${endDate.getDate()}`;
      } else {
        return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}`;
      }
    }
    
    if (startMonth === endMonth) {
      return `${startMonth} ${currentWeekStart.getDate()}-${endDate.getDate()}, ${currentWeekStart.getFullYear()}`;
    } else {
      return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}, ${currentWeekStart.getFullYear()}`;
    }
  };

  const isToday = (dayIndex: number): boolean => {
    const today = new Date();
    const dayDate = getDateForDay(dayIndex);
    return today.toDateString() === dayDate.toDateString();
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-green-800 dark:text-green-400 flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <CalendarIcon className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            Week Schedule
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onWeekChange('prev')} className={isMobile ? "h-8 w-8 p-0" : ""}>
              <ChevronLeft className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
            <span className={`font-medium text-gray-600 dark:text-gray-400 text-center ${isMobile ? 'text-xs min-w-[120px]' : 'text-sm min-w-[180px]'}`}>
              {formatWeekRange()}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onWeekChange('next')} className={isMobile ? "h-8 w-8 p-0" : ""}>
              <ChevronRight className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "px-2 pb-4" : ""}>
        <div className={`grid grid-cols-7 ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {daysOfWeek.map((day, index) => {
            const dayWorkouts = getWorkoutsForDay(index);
            const date = getDateForDay(index);
            
            return (
              <div
                key={day}
                className={`rounded-lg border ${isMobile ? 'p-2' : 'p-3'} ${
                  isToday(index) 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="text-center mb-2">
                  <div className={`font-medium ${isMobile ? 'text-[10px]' : 'text-xs'} ${
                    isToday(index) ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {day}
                  </div>
                  <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} ${
                    isToday(index) ? 'text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => onWorkoutClick?.(workout)}
                      className="w-full text-left"
                    >
                      <Badge
                        variant={workout.is_completed ? "default" : "secondary"}
                        className={`w-full justify-center ${isMobile ? 'text-[8px] px-1 py-0.5 h-auto' : 'text-xs'} ${
                          workout.is_completed 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="truncate">
                          {isMobile 
                            ? workout.workout_type.replace(/_/g, ' ').substring(0, 4)
                            : workout.workout_type.replace(/_/g, ' ').substring(0, 8)
                          }
                        </span>
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekViewCalendar;
