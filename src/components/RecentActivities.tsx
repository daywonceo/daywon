
import { cn } from "@/lib/utils";

type RecentActivitiesProps = {
  month: string;
};

const RecentActivities = ({ month }: RecentActivitiesProps) => {
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
    <div className="mb-16">
      <h2 className="text-6xl font-black mb-6 text-green-800 tracking-tighter">{month}</h2>
      
      <div className="flex flex-col md:flex-row bg-green-50 rounded-xl p-6 shadow-md">
        {/* Text section */}
        <div className="flex-1 pr-4">
          {activities.map((activity, index) => (
            <div key={activity.day} className="flex h-[50px] items-center mb-2">
              <div className="pr-4 w-[40px] text-center text-5xl font-black flex items-center justify-center text-green-800">
                {activity.day}
              </div>
              <div className="flex items-center h-full">
                <p className="text-green-800 font-bold text-lg">{activity.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Boxes grid section */}
        <div className="w-full md:w-[200px] mt-4 md:mt-0">
          <div className="flex mb-2 md:pl-2">
            {activities[0].categories.map((category) => (
              <div 
                key={category} 
                className="w-[50px] flex items-center justify-center font-bold text-[10px] pb-1 text-green-700"
              >
                {category}
              </div>
            ))}
          </div>
          
          <div className="border-l border-green-800">
            {activities.map((activity, index) => (
              <div key={`grid-${activity.day}`} className="flex h-[50px] mb-2">
                {activity.categories.map((category) => (
                  <div 
                    key={`${activity.day}-${category}`} 
                    className={cn(
                      "w-[50px] h-full flex items-center justify-center border-r border-b border-green-800",
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
