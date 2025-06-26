
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { getHabitActivities } from '@/utils/habitActivity';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';

interface HabitCalendarViewProps {
  userHabits?: string[];
}

type ViewType = 'week' | 'month' | 'year';

const HabitCalendarView: React.FC<HabitCalendarViewProps> = ({ 
  userHabits = ["WORKOUT", "DEVOTIONS", "READ"] 
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const habitData = useMemo(() => {
    const activities = getHabitActivities();
    const now = new Date();
    
    let startDate: Date;
    let endDate: Date;
    
    switch (currentView) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
        endDate = endOfWeek(now, { weekStartsOn: 0 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    // Get all days in the current period
    const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create a map of date -> completed habits
    const habitCompletionMap = new Map<string, string[]>();
    
    daysInPeriod.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const completedHabits = userHabits.filter(habit => {
        const activity = activities.find(
          a => a.habitName === habit && a.date === dateStr && a.status === 'completed'
        );
        return !!activity;
      });
      habitCompletionMap.set(dateStr, completedHabits);
    });

    return { habitCompletionMap, startDate, endDate, daysInPeriod };
  }, [currentView, userHabits]);

  const getCompletionColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const completedHabits = habitData.habitCompletionMap.get(dateStr) || [];
    const completionRate = completedHabits.length / userHabits.length;
    
    if (completionRate === 0) return 'bg-gray-100';
    if (completionRate < 0.5) return 'bg-yellow-200';
    if (completionRate < 1) return 'bg-orange-200';
    return 'bg-green-200';
  };

  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">
          Week of {format(habitData.startDate, 'MMM d')} - {format(habitData.endDate, 'MMM d, yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-sm text-gray-600 p-2">
              {day}
            </div>
          ))}
          {habitData.daysInPeriod.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const completedHabits = habitData.habitCompletionMap.get(dateStr) || [];
            return (
              <div
                key={dateStr}
                className={`p-3 rounded-lg border text-center relative ${getCompletionColor(date)}`}
              >
                <div className="font-medium">{date.getDate()}</div>
                <div className="text-xs mt-1">
                  {completedHabits.length}/{userHabits.length}
                </div>
                {completedHabits.length > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">
          {format(habitData.startDate, 'MMMM yyyy')}
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          components={{
            Day: ({ date, ...props }) => {
              const dateStr = date.toISOString().split('T')[0];
              const completedHabits = habitData.habitCompletionMap.get(dateStr) || [];
              const isInCurrentMonth = date >= habitData.startDate && date <= habitData.endDate;
              
              return (
                <div className="relative">
                  <button
                    {...props}
                    className={`w-full h-10 p-1 text-sm hover:bg-gray-100 rounded-md ${
                      !isInCurrentMonth ? 'text-gray-300' : ''
                    } ${isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' : ''}`}
                  >
                    {date.getDate()}
                  </button>
                  {isInCurrentMonth && completedHabits.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {Array.from({ length: Math.min(completedHabits.length, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-green-500 rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </div>
    );
  };

  const renderYearView = () => {
    const monthsInYear = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(habitData.startDate.getFullYear(), i, 1);
      return month;
    });

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">
          {format(habitData.startDate, 'yyyy')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthsInYear.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
            
            const totalPossible = daysInMonth.length * userHabits.length;
            const totalCompleted = daysInMonth.reduce((sum, date) => {
              const dateStr = date.toISOString().split('T')[0];
              const completedHabits = habitData.habitCompletionMap.get(dateStr) || [];
              return sum + completedHabits.length;
            }, 0);
            
            const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
            
            return (
              <Card key={month.getMonth()} className="p-3">
                <div className="text-center">
                  <div className="font-medium text-sm">
                    {format(month, 'MMM')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round(completionRate)}% complete
                  </div>
                  <div className={`mt-2 h-2 rounded-full ${
                    completionRate === 0 ? 'bg-gray-200' :
                    completionRate < 50 ? 'bg-yellow-300' :
                    completionRate < 80 ? 'bg-orange-300' :
                    'bg-green-300'
                  }`}>
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold">Habit Calendar</CardTitle>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'year'] as ViewType[]).map(view => (
              <Button
                key={view}
                variant={currentView === view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView(view)}
                className={`capitalize ${
                  currentView === view 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentView === 'week' && renderWeekView()}
        {currentView === 'month' && renderMonthView()}
        {currentView === 'year' && renderYearView()}
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Legend:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>No habits completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-200 rounded"></div>
              <span>Some habits completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <span>Most habits completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>All habits completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCalendarView;
