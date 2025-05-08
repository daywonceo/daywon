
import { cn } from "@/lib/utils";

type RecentActivitiesProps = {
  month: string;
};

const RecentActivities = ({ month }: RecentActivitiesProps) => {
  const activities = [
    {
      day: 1,
      text: "WENT OUT TO DINNER WITH FRIENDS",
      categories: ["workout", "run", "italian", "screen time"],
      completed: ["workout"],
    },
    {
      day: 2,
      text: "HIT A PR ON BENCH IN THE GYM",
      categories: ["workout", "run", "italian", "screen time"],
      completed: ["workout", "run"],
    },
    {
      day: 3,
      text: "PLAYED IN A NEW SOCCER LEAGUE AND WON",
      categories: ["workout", "run", "italian", "screen time"],
      completed: ["workout", "run", "italian"],
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-5xl font-black mb-2">{month}</h2>
      
      <div className="space-y-1">
        {activities.map((activity) => (
          <div key={activity.day} className="flex">
            <div className="pr-4 text-5xl font-black">{activity.day}</div>
            <div className="flex-1">
              <p className="text-green-800 font-bold text-lg">{activity.text}</p>
              
              <div className="flex mt-1 border-t border-b border-black">
                {activity.categories.map((category, index) => (
                  <div 
                    key={category} 
                    className={cn(
                      "py-1 px-4 border-r border-black uppercase text-xs font-bold rotate-180 writing-vertical",
                      index === 0 && "border-l border-black"
                    )}
                  >
                    {category}
                  </div>
                ))}
                {activity.categories.map((category, index) => (
                  <div 
                    key={`${category}-status`} 
                    className="flex items-center justify-center w-[51px] h-10 border-r border-black"
                  >
                    {activity.completed.includes(category) && (
                      <div className="w-3 h-3 bg-black"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
