
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { recordHabitActivity, getHabitActivities, getHabitCategories, HabitActivity } from "@/utils/habitTracking";
import { toast } from "@/hooks/use-toast";
import { hapticSuccess } from "@/utils/haptics";

type RecentActivitiesProps = {
  month: string;
};

type ActivityStatus = "completed" | "failed" | "empty";

interface DayActivity {
  day: number;
  text: string;
  categories: string[];
  statuses: Record<string, ActivityStatus>;
}

const RecentActivities = ({ month }: RecentActivitiesProps) => {
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [habitCategories, setHabitCategories] = useState<string[]>([]);
  
  // Load activities from storage on component mount
  useEffect(() => {
    loadActivities();
  }, []);
  
  const loadActivities = () => {
    try {
      // Get habit categories - limit to 3
      const categories = getHabitCategories().slice(0, 3);
      setHabitCategories(categories);
      
      // Get recent dates (past 3 days including today)
      const today = new Date();
      const dates = [0, 1, 2].map(daysAgo => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date;
      });
      
      // Format dates as YYYY-MM-DD strings
      const dateStrings = dates.map(date => date.toISOString().split('T')[0]);
      
      // Get all habit activities from storage
      const storedActivities = getHabitActivities();
      
      // Create activities for the past 3 days
      const newActivities = dates.map((date, index) => {
        const day = date.getDate();
        const dateStr = dateStrings[index];
        
        // Create default text description based on date
        let text = "";
        if (index === 0) {
          text = "TODAY'S ACTIVITIES";
        } else if (index === 1) {
          text = "YESTERDAY'S ACTIVITIES";
        } else {
          text = `ACTIVITIES FROM ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
        }
        
        // Initialize statuses map
        const statuses: Record<string, ActivityStatus> = {};
        
        // Populate statuses from stored activities
        categories.forEach(category => {
          const activity = storedActivities.find(
            a => a.habitName === category && a.date === dateStr
          );
          statuses[category] = activity ? activity.status : "empty";
        });
        
        return {
          day,
          text,
          categories,
          statuses
        };
      });
      
      setActivities(newActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
      toast({
        title: "Error",
        description: "Failed to load your recent activities.",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = (dayIndex: number, category: string) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      const currentStatus = newActivities[dayIndex].statuses[category];
      
      // Cycle through statuses: empty -> completed -> failed -> empty
      let newStatus: ActivityStatus;
      if (currentStatus === "empty") {
        newStatus = "completed";
      } else if (currentStatus === "completed") {
        newStatus = "failed";
      } else {
        newStatus = "empty";
      }
      
      newActivities[dayIndex].statuses[category] = newStatus;
      
      // Get the date for this activity
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);
      
      // Record the habit status change
      recordHabitActivity(category, newStatus, date);
      
      // Provide haptic feedback on status change
      hapticSuccess();
      
      return newActivities;
    });
  };

  return (
    <div className="mb-8 sm:mb-16">
      <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6 text-green-800 tracking-tighter">{month}</h2>
      
      <div className="flex flex-col bg-green-50 rounded-xl p-4 sm:p-6 shadow-md overflow-hidden">
        {/* Main grid with connected borders */}
        <div className="flex">
          {/* Habit headers - vertical text */}
          <div className="w-[30px] sm:w-[40px] mr-2 sm:mr-4"></div>
          
          {/* Headers for habit columns */}
          <div className="flex-1 flex">
            {habitCategories.map((category, index) => (
              <div 
                key={`header-${index}`}
                className="min-w-[40px] sm:min-w-[50px] w-[40px] sm:w-[50px] flex justify-center items-end pb-2"
              >
                <span 
                  className="text-xs font-bold text-green-800 transform -rotate-90 origin-bottom-left whitespace-nowrap"
                  title={category}
                >
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Days column */}
          <div className="flex flex-col pr-2 sm:pr-4">
            {activities.map((activity, index) => (
              <div 
                key={`day-${index}`} 
                className="flex items-center h-[40px] sm:h-[50px] mb-2"
              >
                <div className="w-[30px] sm:w-[40px] text-center text-4xl sm:text-5xl font-black text-green-800">
                  {activity.day}
                </div>
              </div>
            ))}
          </div>
          
          {/* Connected boxes grid */}
          <div className="flex-1">
            <div className="border-l border-t border-green-800">
              {activities.map((activity, activityIndex) => (
                <div 
                  key={`grid-${activityIndex}`} 
                  className="flex h-[40px] sm:h-[50px] mb-2"
                >
                  {habitCategories.map((category, categoryIndex) => (
                    <div 
                      key={`${activityIndex}-${category}`} 
                      className={cn(
                        "min-w-[40px] sm:min-w-[50px] w-[40px] sm:w-[50px] h-full flex items-center justify-center border-r border-b border-green-800 cursor-pointer",
                        activityIndex === 0 && "border-t-0"
                      )}
                      onClick={() => toggleStatus(activityIndex, category)}
                    >
                      {activity.statuses[category] === "completed" && (
                        <div className="w-4/5 h-4/5 bg-green-800 rounded-sm flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      {activity.statuses[category] === "failed" && (
                        <div className="w-4/5 h-4/5 rounded-sm border-2 border-red-500 flex items-center justify-center">
                          <X size={16} className="text-red-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Description labels for days */}
        <div className="flex mt-2">
          <div className="w-[30px] sm:w-[40px] mr-2 sm:mr-4"></div>
          <div className="flex-1">
            {activities.map((activity, index) => (
              <div key={`text-${index}`} className="h-[24px] mb-1 last:mb-0">
                <p className="text-green-800 text-xs font-semibold">{activity.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
