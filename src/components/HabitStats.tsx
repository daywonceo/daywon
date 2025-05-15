
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateHabitStats, HabitStats as HabitStatsType } from "@/utils/habitTracking";
import { toast } from "@/hooks/use-toast";

const HabitStats = () => {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [goodHabits, setGoodHabits] = useState<HabitStatsType[]>([]);
  const [badHabits, setBadHabits] = useState<HabitStatsType[]>([]);
  const isMobile = useIsMobile();
  
  // Load habit statistics when component mounts or timeframe changes
  useEffect(() => {
    loadHabitStats();
  }, [timeframe]);
  
  const loadHabitStats = () => {
    try {
      const stats = calculateHabitStats(timeframe);
      setGoodHabits(stats.goodHabits.slice(0, 3)); // Get top 3
      setBadHabits(stats.badHabits.slice(0, 3)); // Get bottom 3
    } catch (error) {
      console.error("Failed to load habit statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load your habit statistics.",
        variant: "destructive"
      });
    }
  };

  // Format score string (e.g., "21/30")
  const formatScore = (completed: number, total: number) => {
    return `${completed}/${total}`;
  };

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
              {goodHabits.length > 0 ? (
                goodHabits.map((habit) => (
                  <div key={habit.habitName} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm sm:text-base text-green-800">{habit.habitName}</span>
                      <span className="text-green-600 text-sm sm:text-base">
                        {formatScore(habit.completed, habit.total)}
                      </span>
                    </div>
                    <Progress 
                      value={habit.percentage} 
                      className="h-2" 
                      useGradient={true}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 italic">
                  Start tracking habits to see your best performances
                </div>
              )}
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
              {badHabits.length > 0 ? (
                badHabits.map((habit) => (
                  <div key={habit.habitName} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm sm:text-base text-red-800">{habit.habitName}</span>
                      <span className="text-red-600 text-sm sm:text-base">
                        {formatScore(habit.completed, habit.total)}
                      </span>
                    </div>
                    <Progress 
                      value={habit.percentage} 
                      className="h-2 bg-gray-100" 
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 italic">
                  Start tracking habits to see areas for improvement
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitStats;
