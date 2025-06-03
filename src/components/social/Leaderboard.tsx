
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Trophy, Medal, Award } from "lucide-react";

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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Award className="text-amber-600" size={20} />;
    return <span className="font-bold text-xl w-5 text-center">{rank}</span>;
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Habit Champions</h2>
        <ToggleGroup type="single" value={period} onValueChange={(value) => value && setPeriod(value as TimePeriod)} className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <ToggleGroupItem value="today" className="text-sm font-medium px-4">Today</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-sm font-medium px-4">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-sm font-medium px-4">Month</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-sm font-medium px-4">All Time</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="space-y-4">
        {filteredData.map((item, index) => (
          <div key={item.rank} className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
            index < 3 
              ? 'bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 border-green-200 dark:border-green-700' 
              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-8 flex justify-center">
                {getRankIcon(item.rank)}
              </div>
              <Avatar className="h-12 w-12 ring-2 ring-green-100 dark:ring-green-800">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback className="bg-green-100 text-green-800">{item.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500">Habit Score: {item.score}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 flex-1 justify-end ml-4 max-w-[200px]">
              <Progress 
                value={item.percentage} 
                className="h-3 bg-gray-200 dark:bg-gray-600 flex-1" 
                useGradient={true}
              />
              <div className="font-bold text-xl text-green-700 dark:text-green-400 w-12 text-center">
                {item.score}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available for this time period.
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
