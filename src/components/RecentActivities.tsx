
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, X } from "lucide-react";
import { useState } from "react";

type RecentActivitiesProps = {
  month: string;
};

type ActivityStatus = "completed" | "failed" | "empty";

const RecentActivities = ({ month }: RecentActivitiesProps) => {
  const isMobile = useIsMobile();
  
  const [activities, setActivities] = useState([
    {
      day: 1,
      text: "WENT OUT TO DINNER WITH FRIENDS",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      statuses: {
        "WORKOUT": "completed" as ActivityStatus,
        "RUN": "empty" as ActivityStatus,
        "ITALIAN": "empty" as ActivityStatus,
        "SCREEN TIME": "empty" as ActivityStatus,
      },
    },
    {
      day: 2,
      text: "HIT A PR ON BENCH IN THE GYM",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      statuses: {
        "WORKOUT": "completed" as ActivityStatus,
        "RUN": "completed" as ActivityStatus,
        "ITALIAN": "empty" as ActivityStatus,
        "SCREEN TIME": "empty" as ActivityStatus,
      },
    },
    {
      day: 3,
      text: "PLAYED IN A NEW SOCCER LEAGUE AND WON",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      statuses: {
        "WORKOUT": "completed" as ActivityStatus,
        "RUN": "completed" as ActivityStatus,
        "ITALIAN": "completed" as ActivityStatus,
        "SCREEN TIME": "empty" as ActivityStatus,
      },
    },
  ]);

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
      return newActivities;
    });
  };

  return (
    <div className="mb-8 sm:mb-16">
      <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6 text-green-800 tracking-tighter">{month}</h2>
      
      <div className="flex flex-col md:flex-row bg-green-50 rounded-xl p-4 sm:p-6 shadow-md overflow-hidden">
        {/* Text section */}
        <div className="flex-1 pr-0 md:pr-4 mb-4 md:mb-0">
          {activities.map((activity, index) => (
            <div key={activity.day} className="flex h-[40px] sm:h-[50px] items-center mb-2">
              <div className="pr-2 sm:pr-4 w-[30px] sm:w-[40px] text-center text-4xl sm:text-5xl font-black flex items-center justify-center text-green-800">
                {activity.day}
              </div>
              <div className="flex items-center h-full">
                <p className="text-green-800 font-bold text-sm sm:text-lg">{activity.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Boxes grid section */}
        <div className="w-full md:w-[200px]">
          {/* Remove the category labels section */}
          
          {/* Connected boxes grid */}
          <div className="border-l border-t border-green-800 overflow-x-auto md:overflow-visible">
            {activities.map((activity, activityIndex) => (
              <div key={`grid-${activity.day}`} className="flex h-[40px] sm:h-[50px] mb-2">
                {activity.categories.map((category, categoryIndex) => (
                  <div 
                    key={`${activity.day}-${category}`} 
                    className={cn(
                      "min-w-[40px] sm:min-w-[50px] w-[40px] sm:w-[50px] h-full flex items-center justify-center border-r border-b border-green-800 cursor-pointer relative",
                      activityIndex === 0 && "border-t-0" // Remove top border for first row since we added it to the container
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
    </div>
  );
};

export default RecentActivities;
