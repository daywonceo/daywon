
import { TrendingDown, TrendingUp } from "lucide-react";

const Progress = () => {
  const progressItems = [
    { period: "FROM LAST WEEK UP", percentage: "32%", trend: "up" },
    { period: "FROM LAST MONTH UP", percentage: "15%", trend: "up" },
    { period: "FROM LAST 6 MONTHS DOWN", percentage: "7%", trend: "down" },
    { period: "FROM LAST YEAR UP", percentage: "21%", trend: "up" },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-center text-2xl font-bold text-green-800 mb-6">HABIT PROGRESS</h2>
      
      <div className="space-y-2 max-w-md mx-auto">
        {progressItems.map((item) => (
          <div key={item.period} className="flex items-center justify-between">
            <div className="font-bold">{item.period}</div>
            <div className="flex items-center gap-2">
              {item.trend === "up" ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : (
                <TrendingDown className="text-red-500" size={20} />
              )}
              <span className="font-bold">{item.percentage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
