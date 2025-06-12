
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown } from "lucide-react";

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
    if (rank === 1) return <Crown className="text-yellow-500" size={18} />;
    if (rank === 2) return <Trophy className="text-gray-400" size={18} />;
    if (rank === 3) return <Medal className="text-amber-600" size={18} />;
    return (
      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <span className="font-bold text-sm text-gray-600 dark:text-gray-300">{rank}</span>
      </div>
    );
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-3">
          <Trophy className="text-yellow-600 dark:text-yellow-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Habit Champions</h2>
        
        <ToggleGroup 
          type="single" 
          value={period} 
          onValueChange={(value) => value && setPeriod(value as TimePeriod)} 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <ToggleGroupItem value="today" className="text-xs font-medium px-3 py-1.5">Today</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-xs font-medium px-3 py-1.5">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-xs font-medium px-3 py-1.5">Month</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-xs font-medium px-3 py-1.5">All Time</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Leaderboard */}
      <div className="space-y-3">
        {filteredData.map((item, index) => (
          <Card key={item.rank} className={`transition-all duration-200 hover:shadow-md ${
            index < 3 
              ? 'bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/10 dark:to-green-900/10 border-yellow-200 dark:border-yellow-800/50' 
              : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {/* Rank Icon */}
                <div className="flex-shrink-0">
                  {getRankIcon(item.rank)}
                </div>
                
                {/* Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-800/50">
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold">
                    {item.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                {/* Name and Score */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score: {item.score}</p>
                </div>
                
                {/* Progress and Score */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="w-16 sm:w-20">
                    <Progress 
                      value={item.percentage} 
                      className="h-2 bg-gray-200 dark:bg-gray-600" 
                      useGradient={true}
                    />
                  </div>
                  <div className="w-8 text-center">
                    <span className="font-bold text-sm text-green-700 dark:text-green-400">
                      {item.score}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-sm text-gray-500">No data available for this period</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
