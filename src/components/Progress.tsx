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
    <DialogContent className="max-w-lg glass border-primary-light/30 pt-12 pb-6 px-6">
      <DialogHeader className="text-center space-y-2 mb-6">
        <DialogTitle className="text-gradient-primary text-xl font-bold">
          {period.period.replace('FROM ', '')} Comparison
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Detailed breakdown of your habit progress
        </DialogDescription>
      </DialogHeader>
      
      {/* Main Progress Indicator */}
      <div className="gradient-warm p-6 rounded-xl border border-primary-light/20 shadow-glow mb-6 mx-auto max-w-sm">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            {period.trend === "up" ? (
              <div className="p-3 rounded-full bg-success/20 border border-success/30">
                <TrendingUp className="text-success w-6 h-6" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-destructive/20 border border-destructive/30">
                <TrendingDown className="text-destructive w-6 h-6" />
              </div>
            )}
            <span className={`text-3xl font-bold ${period.trend === "up" ? "text-success" : "text-destructive"}`}>
              {period.percentage}
            </span>
          </div>
          <p className={`font-medium ${period.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {improvementText}
          </p>
        </div>
      </div>

      {/* Period Comparison Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
        {/* Current Period */}
        <div className="glass-card p-4 border-primary/20 rounded-xl">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary text-sm">{labels.current}</h4>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-md border-2 border-primary-light/30">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">{period.completedCount}</div>
                    <div className="text-white/80 text-xs">done</div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-sm border border-primary-light/20">
                  <Target className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">out of {period.totalPossible} possible</div>
                <div className="bg-primary-light/30 rounded-full h-2 overflow-hidden border border-primary-light/40">
                  <div 
                    className="gradient-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-primary">
                  {Math.round(currentPercentage)}% completion
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Period */}
        <div className="glass-card p-4 border-muted/30 rounded-xl">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-muted-foreground text-sm">{labels.previous}</h4>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center border-2 border-muted/30">
                  <div className="text-center">
                    <div className="text-muted-foreground font-bold text-lg">{period.previousCompletedCount}</div>
                    <div className="text-muted-foreground/60 text-xs">done</div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-sm border border-muted/20">
                  <Target className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">out of {period.previousTotalPossible} possible</div>
                <div className="bg-muted/20 rounded-full h-2 overflow-hidden border border-muted/30">
                  <div 
                    className="bg-muted/60 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(previousPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {Math.round(previousPercentage)}% completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="space-y-4 max-w-md mx-auto">
        <div className="gradient-subtle p-4 rounded-xl border border-primary-light/20">
          <h4 className="font-semibold text-primary mb-3 flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            {period.trend === 'up' ? 'What Likely Helped' : 'Areas to Improve'}
          </h4>
          <div className="space-y-2">
            {getReasonsForChange().slice(0, 3).map((reason, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-white/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${period.trend === 'up' ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-sm text-foreground/80">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        <div className={`p-4 rounded-xl border text-center ${period.trend === 'up' 
          ? 'bg-success/10 border-success/20' 
          : 'bg-warning/10 border-warning/20'
        }`}>
          <p className={`text-sm font-medium ${period.trend === 'up' ? 'text-success' : 'text-warning'}`}>
            {period.trend === 'up' 
              ? "🎉 Excellent progress! Your consistency is creating lasting change." 
              : "💪 Small steps lead to big wins. Every day is a new opportunity to improve."}
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
