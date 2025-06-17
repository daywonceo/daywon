
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHabitProgress } from "@/hooks/useHabitProgress";
import { useEffect, useState } from "react";

interface ProgressProps {
  userHabits?: string[];
}

const Progress = ({ userHabits }: ProgressProps) => {
  const isMobile = useIsMobile();
  const progressData = useHabitProgress(userHabits);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for habit updates to refresh progress
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom habit update events
    const handleHabitUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('habitUpdated', handleHabitUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('habitUpdated', handleHabitUpdate);
    };
  }, []);

  // Force re-render when habits change
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [userHabits?.join(',')]);

  return (
    <Card className="mb-24 border-green-200 shadow-md">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800">HABIT PROGRESS</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm border-green-200 w-full sm:w-auto"
            onClick={() => {
              // Future: Add download report functionality
              console.log('Download report clicked');
            }}
          >
            Download Report
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {progressData.map((item) => {
            const currentCompletion = item.totalPossible > 0 
              ? Math.round((item.completedCount / item.totalPossible) * 100) 
              : 0;
            const previousCompletion = item.previousTotalPossible > 0 
              ? Math.round((item.previousCompletedCount / item.previousTotalPossible) * 100) 
              : 0;

            return (
              <div 
                key={item.period} 
                className="bg-green-50 p-3 sm:p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-xs sm:text-sm text-gray-700">
                    {item.period}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {item.trend === "up" ? (
                      <TrendingUp className="text-green-600" size={isMobile ? 16 : 20} />
                    ) : (
                      <TrendingDown className="text-red-500" size={isMobile ? 16 : 20} />
                    )}
                    <span className={`font-bold text-sm sm:text-base ${item.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                      {item.percentage}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>Current: {item.completedCount}/{item.totalPossible}</span>
                    <span>{currentCompletion}%</span>
                  </div>
                  <ProgressBar 
                    value={currentCompletion} 
                    className="h-2 bg-gray-200"
                    useGradient={true}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  Previous: {item.previousCompletedCount}/{item.previousTotalPossible} ({previousCompletion}%)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Progress;
