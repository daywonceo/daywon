
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateHabitStats, HabitStats as HabitStatsType } from "@/utils/habitStats";
import { toast } from "@/hooks/use-toast";
import HabitDetailModal from "@/components/habit/HabitDetailModal";

interface HabitStatsProps {
  refreshTrigger?: number; // Add prop to force refresh when habits change
}

const HabitStats = ({ refreshTrigger }: HabitStatsProps) => {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [goodHabits, setGoodHabits] = useState<HabitStatsType[]>([]);
  const [badHabits, setBadHabits] = useState<HabitStatsType[]>([]);
  const [inProgressHabits, setInProgressHabits] = useState<HabitStatsType[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<HabitStatsType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Load habit statistics when component mounts, timeframe changes, or refreshTrigger changes
  useEffect(() => {
    loadHabitStats();
  }, [timeframe, refreshTrigger]);
  
  const loadHabitStats = () => {
    try {
      const stats = calculateHabitStats(timeframe);
      setGoodHabits(stats.goodHabits.slice(0, 3)); // Top 3
      setBadHabits(stats.badHabits.slice(0, 3)); // Bottom 3
      setInProgressHabits(stats.inProgressHabits.slice(0, 3)); // Top 3 in progress
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

  const handleHabitClick = (habit: HabitStatsType) => {
    setSelectedHabit(habit);
    setIsModalOpen(true);
  };

  const renderHabitSection = (habits: HabitStatsType[], title: string, emoji: string, colorClass: string) => {
    if (habits.length === 0) {
      return (
        <div className="text-center text-gray-500 italic py-4">
          No {title.toLowerCase()} found for this period
        </div>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {habits.map((habit) => (
          <div 
            key={habit.habitName} 
            className="space-y-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
            onClick={() => handleHabitClick(habit)}
          >
            <div className="flex justify-between items-center">
              <span className={`font-medium text-sm sm:text-base ${colorClass}`}>
                {habit.habitName}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm sm:text-base ${colorClass.replace('800', '600')}`}>
                  {formatScore(habit.completed, habit.total)}
                </span>
                <span className="text-xs text-gray-400">tap for details</span>
              </div>
            </div>
            <Progress 
              value={habit.percentage} 
              className="h-2" 
              useGradient={habit.category === 'good'}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="mb-8 sm:mb-12 border-green-200 shadow-md">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800">HABIT PERFORMANCE</h2>
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
          <div className="space-y-6 sm:space-y-8">
            {/* Good Habits - 70%+ completion */}
            <div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                  ☺
                </div>
                <h3 className="font-bold text-base sm:text-lg text-green-700 mb-1">Good Habits</h3>
                <p className="text-xs text-gray-500">70%+ completion rate</p>
              </div>
              {renderHabitSection(goodHabits, "Good Habits", "☺", "text-green-800")}
            </div>
            
            {/* In Progress Habits - 40-70% completion */}
            {inProgressHabits.length > 0 && (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                    🔄
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-yellow-700 mb-1">In Progress</h3>
                  <p className="text-xs text-gray-500">40-70% completion rate</p>
                </div>
                {renderHabitSection(inProgressHabits, "In Progress Habits", "🔄", "text-yellow-800")}
              </div>
            )}
            
            {/* Bad Habits - Below 40% completion */}
            <div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                  ☹
                </div>
                <h3 className="font-bold text-base sm:text-lg text-red-700 mb-1">Needs Attention</h3>
                <p className="text-xs text-gray-500">Below 40% completion rate</p>
              </div>
              {renderHabitSection(badHabits, "Bad Habits", "☹", "text-red-800")}
            </div>
          </div>
        </CardContent>
      </Card>

      <HabitDetailModal 
        habit={selectedHabit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timeframe={timeframe}
      />
    </>
  );
};

export default HabitStats;
