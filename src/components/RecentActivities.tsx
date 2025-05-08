
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type RecentActivitiesProps = {
  month: string;
};

const RecentActivities = ({ month }: RecentActivitiesProps) => {
  const isMobile = useIsMobile();
  
  const activities = [
    {
      day: 1,
      text: "WENT OUT TO DINNER WITH FRIENDS",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      completed: ["WORKOUT"],
    },
    {
      day: 2,
      text: "HIT A PR ON BENCH IN THE GYM",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      completed: ["WORKOUT", "RUN"],
    },
    {
      day: 3,
      text: "PLAYED IN A NEW SOCCER LEAGUE AND WON",
      categories: ["WORKOUT", "RUN", "ITALIAN", "SCREEN TIME"],
      completed: ["WORKOUT", "RUN", "ITALIAN"],
    },
  ];

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
          <div className="flex mb-2 md:pl-2 overflow-x-auto pb-1 md:overflow-visible">
            {activities[0].categories.map((category) => (
              <div 
                key={category} 
                className="min-w-[40px] sm:min-w-[50px] w-[40px] sm:w-[50px] flex items-center justify-center font-bold text-[8px] sm:text-[10px] pb-1 text-green-700"
              >
                {category}
              </div>
            ))}
          </div>
          
          <div className="border-l border-green-800 overflow-x-auto md:overflow-visible">
            {activities.map((activity, index) => (
              <div key={`grid-${activity.day}`} className="flex h-[40px] sm:h-[50px] mb-2">
                {activity.categories.map((category) => (
                  <div 
                    key={`${activity.day}-${category}`} 
                    className={cn(
                      "min-w-[40px] sm:min-w-[50px] w-[40px] sm:w-[50px] h-full flex items-center justify-center border-r border-b border-green-800",
                      index === 0 && "border-t"
                    )}
                  >
                    {activity.completed.includes(category) && (
                      <div className="w-4/5 h-4/5 bg-green-800 rounded-sm"></div>
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
