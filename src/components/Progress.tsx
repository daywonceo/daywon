
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Progress = () => {
  const progressItems = [
    { period: "FROM LAST WEEK", percentage: "32%", trend: "up" },
    { period: "FROM LAST MONTH", percentage: "15%", trend: "up" },
    { period: "FROM LAST 6 MONTHS", percentage: "7%", trend: "down" },
    { period: "FROM LAST YEAR", percentage: "21%", trend: "up" },
  ];

  return (
    <Card className="mb-24 border-green-200 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-green-800">HABIT PROGRESS</h2>
          <Button variant="outline" size="sm" className="text-sm border-green-200">
            Download Report
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {progressItems.map((item) => (
            <div 
              key={item.period} 
              className="flex items-center justify-between bg-green-50 p-4 rounded-lg"
            >
              <div className="font-medium">{item.period}</div>
              <div className="flex items-center gap-2">
                {item.trend === "up" ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-500" size={20} />
                )}
                <span className={`font-bold ${item.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                  {item.percentage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Progress;
