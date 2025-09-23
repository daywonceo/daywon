
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateHabitStats, HabitStats as HabitStatsType } from "@/utils/habitStats";
import { toast } from "@/hooks/use-toast";
import HabitDetailModal from "@/components/habit/HabitDetailModal";
import { capitalizeHabitName } from "@/lib/utils";

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

  const handleTimeframeChange = (newTimeframe: "week" | "month" | "year") => {
    setTimeframe(newTimeframe);
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
                {capitalizeHabitName(habit.habitName)}
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
      <Card className="mb-8 sm:mb-12 glass border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Performance Analytics
                </h2>
                <p className="text-xs text-muted-foreground">Track your habit consistency</p>
              </div>
            </div>
            <div className="flex bg-muted/50 rounded-lg p-1 border border-primary/20 backdrop-blur-sm">
              <button 
                className={`px-3 py-2 rounded-md flex-1 transition-all text-sm font-medium ${
                  timeframe === 'week' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
                onClick={() => handleTimeframeChange('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-2 rounded-md flex-1 transition-all text-sm font-medium ${
                  timeframe === 'month' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
                onClick={() => handleTimeframeChange('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-2 rounded-md flex-1 transition-all text-sm font-medium ${
                  timeframe === 'year' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
                onClick={() => handleTimeframeChange('year')}
              >
                Year
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Performance Habits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">High Performance</h3>
                  <p className="text-xs text-muted-foreground">70%+ completion rate</p>
                </div>
              </div>
              <div className="space-y-3">
                {goodHabits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full"></div>
                    </div>
                    <p className="text-sm">No high performers yet</p>
                    <p className="text-xs">Keep building consistency!</p>
                  </div>
                ) : (
                  goodHabits.map((habit) => (
                    <div 
                      key={habit.habitName} 
                      className="group p-3 rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 hover:from-green-100/50 hover:to-emerald-100/50 cursor-pointer transition-all duration-200 hover:border-green-300/50 hover:shadow-sm"
                      onClick={() => handleHabitClick(habit)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-800 group-hover:text-green-900">
                          {capitalizeHabitName(habit.habitName)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-700">
                            {formatScore(habit.completed, habit.total)}
                          </span>
                          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {Math.round(habit.percentage)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={habit.percentage} 
                        className="h-2" 
                        useGradient={true}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Needs Attention Habits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-red-200/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 border-2 border-white rounded-full bg-white/20"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Needs Focus</h3>
                  <p className="text-xs text-muted-foreground">Below 40% completion</p>
                </div>
              </div>
              <div className="space-y-3">
                {badHabits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full"></div>
                    </div>
                    <p className="text-sm">All habits performing well</p>
                    <p className="text-xs">Great consistency!</p>
                  </div>
                ) : (
                  badHabits.map((habit) => (
                    <div 
                      key={habit.habitName} 
                      className="group p-3 rounded-lg border border-red-200/50 bg-gradient-to-r from-red-50/50 to-red-50/30 hover:from-red-100/50 hover:to-red-100/30 cursor-pointer transition-all duration-200 hover:border-red-300/50 hover:shadow-sm"
                      onClick={() => handleHabitClick(habit)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-red-800 group-hover:text-red-900">
                          {capitalizeHabitName(habit.habitName)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-red-700">
                            {formatScore(habit.completed, habit.total)}
                          </span>
                          <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            {Math.round(habit.percentage)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={habit.percentage} 
                        className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600" 
                      />
                    </div>
                  ))
                )}
              </div>
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
