
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const HabitStats = () => {
  const [timeframe, setTimeframe] = useState("month"); // month, week, year
  const isMobile = useIsMobile();
  
  const goodHabits = [
    { name: "WORKOUT", score: "21/30", percentage: 70 },
    { name: "WATER", score: "30/30", percentage: 100 },
    { name: "LANGUAGE", score: "25/30", percentage: 83 },
  ];

  const badHabits = [
    { name: "RUN", score: "4/30", percentage: 13 },
    { name: "DEVOTION", score: "6/30", percentage: 20 },
    { name: "SLEEP GOAL", score: "11/30", percentage: 37 },
  ];

  return (
    <Card className="mb-8 sm:mb-12 border-green-200 shadow-md">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800">BEST/WORST HABITS</h2>
          <div className="flex bg-green-50 rounded-md p-1 text-xs sm:text-sm overflow-hidden">
            <button 
              className={`px-2 py-1 rounded-md ${timeframe === 'week' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              Week
            </button>
            <button 
              className={`px-2 py-1 rounded-md ${timeframe === 'month' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              Month
            </button>
            <button 
              className={`px-2 py-1 rounded-md ${timeframe === 'year' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setTimeframe('year')}
            >
              Year
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <div className="flex flex-col md:flex-row justify-center gap-6 sm:gap-8 mt-3 sm:mt-4">
          {/* Good Habits */}
          <div className="md:w-1/2 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                ☺
              </div>
              <h3 className="font-bold text-base sm:text-lg text-green-700 mb-3 sm:mb-4">Good Habits</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {goodHabits.map((habit) => (
                <div key={habit.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm sm:text-base text-green-800">{habit.name}</span>
                    <span className="text-green-600 text-sm sm:text-base">{habit.score}</span>
                  </div>
                  <Progress value={habit.percentage} className="h-2" indicatorColor="bg-green-500" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Bad Habits */}
          <div className="md:w-1/2 space-y-4 mt-6 md:mt-0">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                ☹
              </div>
              <h3 className="font-bold text-base sm:text-lg text-red-700 mb-3 sm:mb-4">Bad Habits</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {badHabits.map((habit) => (
                <div key={habit.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm sm:text-base text-red-800">{habit.name}</span>
                    <span className="text-red-600 text-sm sm:text-base">{habit.score}</span>
                  </div>
                  <Progress value={habit.percentage} className="h-2" indicatorColor="bg-red-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitStats;
