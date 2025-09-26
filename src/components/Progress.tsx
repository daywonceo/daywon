import { TrendingDown, TrendingUp, Download, Info, Calendar, Target, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHabitProgress, ProgressPeriod } from "@/hooks/useHabitProgress";
import { useEffect, useState } from "react";
import { generateHabitReport } from "@/utils/habitReportGenerator";
import { toast } from "@/hooks/use-toast";

interface ProgressProps {
  userHabits?: string[];
}

const ComparisonModal = ({ period }: { period: ProgressPeriod }) => {
  const currentPercentage = period.totalPossible > 0 ? (period.completedCount / period.totalPossible) * 100 : 0;
  const previousPercentage = period.previousTotalPossible > 0 ? (period.previousCompletedCount / period.previousTotalPossible) * 100 : 0;
  
  const getTimePeriodLabel = (periodName: string) => {
    switch(periodName) {
      case "FROM LAST WEEK": return { current: "This Week", previous: "Last Week" };
      case "FROM LAST MONTH": return { current: "This Month", previous: "Last Month" };
      case "FROM LAST 6 MONTHS": return { current: "Last 6 Months", previous: "Previous 6 Months" };
      case "FROM LAST YEAR": return { current: "This Year", previous: "Last Year" };
      default: return { current: "Current Period", previous: "Previous Period" };
    }
  };

  const labels = getTimePeriodLabel(period.period);
  const improvementText = period.trend === 'up' 
    ? `You improved by ${period.percentage}!` 
    : `You declined by ${period.percentage}.`;
    
  const getReasonsForChange = () => {
    if (period.trend === 'up') {
      return [
        "More consistent daily check-ins",
        "Better habit tracking routine",
        "Increased motivation and focus",
        "Improved time management",
        "Stronger habit formation"
      ];
    } else {
      return [
        "Missed daily check-ins",
        "Inconsistent routine",
        "External life stressors",
        "Need for better reminders",
        "Habit difficulty adjustment needed"
      ];
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {period.period} Comparison
        </DialogTitle>
        <DialogDescription>
          Detailed breakdown of your habit progress comparison
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Progress Summary */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary-light/20 to-accent/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            {period.trend === "up" ? (
              <TrendingUp className="text-green-600 w-6 h-6" />
            ) : (
              <TrendingDown className="text-red-500 w-6 h-6" />
            )}
            <span className={`text-2xl font-bold ${period.trend === "up" ? "text-green-600" : "text-red-500"}`}>
              {period.percentage}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{improvementText}</p>
        </div>

        {/* Period Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/80 backdrop-blur-sm border">
            <h4 className="font-medium text-sm text-primary mb-2">{labels.current}</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">{period.completedCount}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{period.totalPossible} total</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(currentPercentage)}% completion
              </div>
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50 border">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">{labels.previous}</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{period.previousCompletedCount}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{period.previousTotalPossible} total</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(previousPercentage)}% completion
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {period.trend === 'up' ? 'What Likely Helped:' : 'Areas to Improve:'}
          </h4>
          <ul className="space-y-1">
            {getReasonsForChange().slice(0, 3).map((reason, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${period.trend === 'up' ? 'bg-green-500' : 'bg-orange-500'}`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Suggestion */}
        <div className="p-3 rounded-lg bg-accent/20 border border-accent/30">
          <p className="text-sm text-accent-foreground">
            {period.trend === 'up' 
              ? "Keep up the great work! Your consistency is paying off." 
              : "Small improvements each day can lead to big changes. Focus on one habit at a time."}
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

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
            <Dialog key={item.period}>
              <DialogTrigger asChild>
                <div 
                  className="bg-green-50 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors duration-200 group"
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
              </DialogTrigger>
              <ComparisonModal period={item} />
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Progress;
