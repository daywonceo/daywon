
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
      <h2 className="text-6xl font-black mb-4">{month}</h2>
      
      <div className="flex">
        <div className="flex-1">
          {activities.map((activity) => (
            <div key={activity.day} className="flex mb-2 items-start">
              <div className="pr-4 text-5xl font-black">{activity.day}</div>
              <div className="pt-2">
                <p className="text-green-800 font-bold text-lg">{activity.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-[200px]">
          <div className="flex">
            {activities[0].categories.map((category) => (
              <div 
                key={category} 
                className="w-[50px] flex items-center justify-center font-bold text-[10px] pb-1"
              >
                {category}
              </div>
            ))}
          </div>
          
          <div className="border-l border-green-800">
            {activities.map((activity) => (
              <div key={`grid-${activity.day}`} className="flex h-[40px]">
                {activity.categories.map((category) => (
                  <div 
                    key={`${activity.day}-${category}`} 
                    className="w-[50px] h-full flex items-center justify-center border-r border-b border-green-800"
                  >
                    {activity.completed.includes(category) && (
                      <div className="w-full h-full bg-black"></div>
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
