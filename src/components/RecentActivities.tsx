import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, X, Edit } from "lucide-react";
import { recordHabitActivity, getHabitActivities, getHabitCategories, HabitActivity } from "@/utils/habitTracking";
import { toast } from "@/hooks/use-toast";
import { hapticSuccess } from "@/utils/haptics";
import { Input } from "@/components/ui/input";

type RecentActivitiesProps = {
  month: string;
};

type ActivityStatus = "completed" | "failed" | "empty";

interface DayActivity {
  day: number;
  text: string;
  categories: string[];
  statuses: Record<string, ActivityStatus>;
  isEditing: boolean;
}

// Define our specific three habits
const FIXED_HABITS = ["WORKOUT", "DEVOTIONS", "READ"];

const RecentActivities = ({ month }: RecentActivitiesProps) => {
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<DayActivity[]>([]);
  
  // Load activities from storage on component mount
  useEffect(() => {
    loadActivities();
  }, []);
  
  const loadActivities = () => {
    try {
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
        FIXED_HABITS.forEach(category => {
          const activity = storedActivities.find(
            a => a.habitName === category && a.date === dateStr
          );
          statuses[category] = activity ? activity.status : "empty";
        });
        
        return {
          day,
          text,
          categories: FIXED_HABITS,
          statuses,
          isEditing: false
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

  const toggleEditMode = (dayIndex: number) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].isEditing = !newActivities[dayIndex].isEditing;
      return newActivities;
    });
  };

  const updateActivityText = (dayIndex: number, newText: string) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].text = newText;
      newActivities[dayIndex].isEditing = false;
      return newActivities;
    });
  };

  return (
    <div className="mb-6 sm:mb-16">
      <h2 className="text-3xl sm:text-6xl font-black mb-3 sm:mb-6 text-green-800 tracking-tighter">{month}</h2>
      
      <div className="flex flex-col bg-green-50 rounded-xl p-3 sm:p-6 shadow-md overflow-hidden">
        {/* Column headers - different styling for mobile vs desktop */}
        <div className="flex mb-4 sm:mb-6">
          {/* Empty space for day number column */}
          <div className="w-[40px] sm:w-[60px] mr-2 sm:mr-4"></div>
          
          {/* Space for text description */}
          <div className="flex-grow mr-3 sm:mr-4"></div>
          
          {/* Habit header labels - responsive text sizing */}
          <div className="flex gap-2 sm:gap-4">
            {FIXED_HABITS.map((habit, index) => (
              <div key={`header-${index}`} className="w-[45px] sm:w-[65px] text-center">
                {/* Mobile-specific styling with smaller text and padding */}
                <span className="text-[10px] px-1 leading-tight block break-words sm:hidden font-bold text-green-800">
                  {habit}
                </span>
                {/* Desktop styling - original design */}
                <span className="hidden sm:block text-sm font-bold text-green-800 leading-tight">
                  {habit}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Activity rows with improved mobile layout */}
        {activities.map((activity, activityIndex) => (
          <div key={`activity-${activityIndex}`} className="flex items-center mb-6 sm:mb-8 last:mb-0">
            {/* Day number */}
            <div className="flex items-center justify-center w-[30px] sm:w-[45px] mr-2 sm:mr-4">
              <div className="text-center text-3xl sm:text-5xl font-black text-green-800">
                {activity.day}
              </div>
            </div>
            
            {/* Activity description - responsive text size */}
            <div className="flex-grow mr-3 sm:mr-4 flex items-center">
              {activity.isEditing ? (
                <Input 
                  value={activity.text}
                  onChange={(e) => {
                    const newActivities = [...activities];
                    newActivities[activityIndex].text = e.target.value;
                    setActivities(newActivities);
                  }}
                  onBlur={() => toggleEditMode(activityIndex)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateActivityText(activityIndex, activity.text);
                    }
                  }}
                  autoFocus
                  className="text-green-800 text-sm sm:text-lg font-semibold py-1"
                />
              ) : (
                <div className="flex items-center">
                  <p className="text-green-800 text-sm sm:text-lg font-semibold leading-tight">{activity.text}</p>
                  <button 
                    onClick={() => toggleEditMode(activityIndex)}
                    className="ml-2 text-green-700 hover:text-green-900 transition-colors"
                  >
                    <Edit size={12} className="sm:hidden" />
                    <Edit size={14} className="hidden sm:block" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Habit boxes - improved sizing and spacing */}
            <div className="flex gap-2 sm:gap-4">
              {activity.categories.map((category, categoryIndex) => (
                <div 
                  key={`${activityIndex}-${category}`} 
                  className="h-[45px] w-[45px] sm:h-[60px] sm:w-[65px] border-2 border-green-800 rounded-md flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => toggleStatus(activityIndex, category)}
                >
                  {activity.statuses[category] === "completed" && (
                    <div className="w-4/5 h-4/5 bg-green-800 rounded-sm flex items-center justify-center">
                      <Check size={16} className="sm:hidden text-white" />
                      <Check size={20} className="hidden sm:block text-white" />
                    </div>
                  )}
                  {activity.statuses[category] === "failed" && (
                    <div className="w-4/5 h-4/5 rounded-sm border-2 border-red-500 flex items-center justify-center">
                      <X size={16} className="sm:hidden text-red-500" />
                      <X size={20} className="hidden sm:block text-red-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
