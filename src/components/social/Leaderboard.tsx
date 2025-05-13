
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LeaderboardItem {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  percentage: number;
}

interface LeaderboardProps {
  leaderboardData: LeaderboardItem[];
}

type TimePeriod = "today" | "week" | "month" | "all";

const Leaderboard = ({ leaderboardData }: LeaderboardProps) => {
  const [period, setPeriod] = useState<TimePeriod>("all");

  // In a real app, this would filter based on actual data
  // For this demo, we'll simulate filtering by showing fewer items for shorter periods
  const getFilteredData = () => {
    switch (period) {
      case "today":
        return leaderboardData.slice(0, 5);
      case "week":
        return leaderboardData.slice(0, 7);
      case "month":
        return leaderboardData.slice(0, 9);
      case "all":
      default:
        return leaderboardData;
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-4">
      {/* Time period filter */}
      <div className="flex justify-center mb-4">
        <ToggleGroup type="single" value={period} onValueChange={(value) => value && setPeriod(value as TimePeriod)}>
          <ToggleGroupItem value="today" className="text-xs">TODAY</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-xs">WEEK</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-xs">MONTH</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-xs">ALL TIME</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex justify-center items-center mb-6">
        <div className="w-full grid grid-cols-12 px-4">
          <div className="col-span-7"></div>
          <div className="col-span-5 text-center">
            <h2 className="font-bold text-lg">HABIT SCORE</h2>
          </div>
        </div>
      </div>
      
      <div className="space-y-5">
        {filteredData.map((item) => (
          <div key={item.rank} className="flex items-center">
            <div className="font-bold text-xl w-8 mr-3 text-center">{item.rank}</div>
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback>{item.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-3">
              <p className="font-bold text-base w-40 truncate">{item.name}</p>
              <Progress 
                value={item.percentage} 
                className="h-5 bg-gray-100 max-w-[120px]" 
                useGradient={true}
              />
              <div className="font-bold text-xl w-8 text-right">{item.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
