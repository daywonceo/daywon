
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
    <div className="space-y-6">
      {/* Time period filter */}
      <div className="flex justify-center mb-6">
        <ToggleGroup type="single" value={period} onValueChange={(value) => value && setPeriod(value as TimePeriod)}>
          <ToggleGroupItem value="today" className="text-sm font-medium">TODAY</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-sm font-medium">WEEK</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-sm font-medium">MONTH</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-sm font-medium">ALL TIME</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Header row */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="font-bold text-lg pl-14">USERS</div>
        <div className="font-bold text-lg pr-4">HABIT SCORE</div>
      </div>
      
      {/* Leaderboard items */}
      <div className="space-y-6">
        {filteredData.map((item) => (
          <div key={item.rank} className="flex items-center justify-between px-2">
            {/* Left side: rank, avatar and name */}
            <div className="flex items-center space-x-3">
              <div className="font-bold text-xl w-8 text-center">{item.rank}</div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback>{item.name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-bold text-lg truncate max-w-[150px]">{item.name}</p>
            </div>
            
            {/* Right side: progress bar and score */}
            <div className="flex items-center space-x-4">
              <Progress 
                value={item.percentage} 
                className="h-5 bg-gray-100 w-[100px]" 
                useGradient={true}
              />
              <div className="font-bold text-xl w-10 text-center">{item.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
