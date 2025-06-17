import { TrendingDown, TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHabitProgress } from "@/hooks/useHabitProgress";
import { useEffect, useState } from "react";
import { generateHabitReport } from "@/utils/habitReportGenerator";
import { toast } from "@/hooks/use-toast";

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

  const handleDownloadReport = async () => {
    try {
      await generateHabitReport(userHabits || ["WORKOUT", "DEVOTIONS", "READ"]);
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
            <div 
              key={item.period} 
              className="bg-green-50 p-3 sm:p-4 rounded-lg"
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Progress;
