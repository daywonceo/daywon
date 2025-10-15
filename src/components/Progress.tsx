import { TrendingDown, TrendingUp, Download, Info, Calendar, Target, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHabitProgress, ProgressPeriod } from "@/hooks/useHabitProgress";
import { useEffect, useState } from "react";
import { generateHabitReport } from "@/utils/habitReportGenerator";
import { toast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import { getHabitActivities } from "@/utils/habitActivity";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface ProgressProps {
  userHabits?: string[];
}

interface HabitBreakdown {
  habitName: string;
  completed: number;
  possible: number;
  percentage: number;
}

const HabitBreakdownModal = ({ 
  period, 
  open, 
  onOpenChange 
}: { 
  period: ProgressPeriod | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { habits } = useHabits();
  const [breakdown, setBreakdown] = useState<HabitBreakdown[]>([]);

  useEffect(() => {
    if (!period || !open) return;

    const activities = getHabitActivities();
    const now = new Date();
    
    // Determine date range based on period
    let days = 7;
    let offset = 7;
    if (period.period === "FROM LAST MONTH") {
      days = 30;
      offset = 0;
    } else if (period.period === "FROM LAST 6 MONTHS") {
      days = 180;
      offset = 0;
    } else if (period.period === "FROM LAST YEAR") {
      days = 365;
      offset = 0;
    } else if (period.period === "FROM LAST WEEK") {
      days = 7;
      offset = 0;
    }

    const endDate = new Date(now);
    endDate.setDate(now.getDate() - (period.period === "FROM LAST WEEK" ? 0 : 0));
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days + 1);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Calculate breakdown for each habit
    const habitBreakdowns: HabitBreakdown[] = habits
      .filter(h => h.status === 'active')
      .map(habit => {
        const habitCreatedAt = new Date(habit.created_at);
        
        // Count possible days for this habit
        let possible = 0;
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (habitCreatedAt <= currentDate) {
            possible++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count completed activities
        const completed = activities.filter(a => 
          (a.habitId === habit.id || a.habitName === habit.name) &&
          a.date >= startStr && 
          a.date <= endStr &&
          a.status === 'completed'
        ).length;

        return {
          habitName: habit.name,
          completed,
          possible,
          percentage: possible > 0 ? (completed / possible) * 100 : 0
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    setBreakdown(habitBreakdowns);
  }, [period, open, habits]);

  if (!period) return null;

  const currentPercentage = period.totalPossible > 0 
    ? (period.completedCount / period.totalPossible) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Habit Breakdown - {period.period.replace("FROM ", "")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 glass-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
            <div className="text-2xl font-bold mb-2">
              {Math.round(currentPercentage)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {period.completedCount} completed out of {period.totalPossible} total tracking opportunities
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ({breakdown.length} active habits × days in period)
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Habit Performance</h3>
            {breakdown.map((habit, index) => (
              <div key={index} className="p-3 glass-card rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{habit.habitName}</div>
                  <div className="text-sm font-semibold">
                    {Math.round(habit.percentage)}%
                  </div>
                </div>
                <ProgressBar value={habit.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {habit.completed} / {habit.possible} days completed
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ComparisonModal = ({ period }: { period: ProgressPeriod }) => {
  const currentPercentage = period.totalPossible > 0 
    ? (period.completedCount / period.totalPossible) * 100 
    : 0;
  const previousPercentage = period.previousTotalPossible > 0
    ? (period.previousCompletedCount / period.previousTotalPossible) * 100
    : 0;

  const reasonForChange = () => {
    if (period.trend === 'up') {
      return "This improvement could be due to better consistency, more habits tracked, or increased motivation.";
    } else {
      return "This decline might be due to missed days, fewer habits tracked, or challenging circumstances.";
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Progress Comparison - {period.period.replace("FROM ", "")}
        </DialogTitle>
        <DialogDescription>
          Here's how your habit completion has changed
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Main Change Indicator */}
        <div className={`p-6 rounded-lg ${
          period.trend === 'up' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {period.trend === 'up' ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
            <div>
              <div className="text-sm text-muted-foreground">
                {period.trend === 'up' ? 'Improved by' : 'Decreased by'}
              </div>
              <div className={`text-3xl font-bold ${
                period.trend === 'up' ? 'text-green-600' : 'text-red-500'
              }`}>
                {period.percentage}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {reasonForChange()}
          </p>
        </div>

        {/* Current vs Previous Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 glass-card rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div className="text-sm font-medium">Current Period</div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {Math.round(currentPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {period.completedCount} / {period.totalPossible} completed
            </div>
          </div>

          <div className="p-4 glass-card rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm font-medium">Previous Period</div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {Math.round(previousPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {period.previousCompletedCount} / {period.previousTotalPossible} completed
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-blue-900 mb-1">
                {period.trend === 'up' ? 'Keep up the great work!' : 'Stay motivated!'}
              </div>
              <p className="text-xs text-blue-800">
                {period.trend === 'up' 
                  ? 'Your consistency is paying off. Try to maintain this momentum!'
                  : 'Everyone has challenging periods. Focus on one habit at a time to rebuild your momentum.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

const Progress = ({ userHabits }: ProgressProps) => {
  const isMobile = useIsMobile();
  const progressData = useHabitProgress(userHabits);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<ProgressPeriod | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

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

  const handleDownloadReport = async () => {
    try {
      await generateHabitReport(userHabits || ["Workout", "Devotions", "Read"]);
      toast({
        title: "Report Downloaded",
        description: "Your habit progress report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-24 border-green-200 shadow-md">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800">HABIT PROGRESS</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm border-green-200 w-full sm:w-auto"
            onClick={handleDownloadReport}
          >
            <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Download Report
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {progressData.map((item) => (
            <div key={item.period}>
              <div 
                className="bg-green-50 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors duration-200 group"
                onClick={() => {
                  setSelectedPeriod(item);
                  setBreakdownOpen(true);
                }}
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
                    <Info className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <HabitBreakdownModal 
        period={selectedPeriod}
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </Card>
  );
};

export default Progress;
