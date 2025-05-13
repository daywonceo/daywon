
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

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

const Leaderboard = ({ leaderboardData }: LeaderboardProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center mb-6">
        <div className="w-full grid grid-cols-12 px-4">
          <div className="col-span-7"></div>
          <div className="col-span-5 text-center">
            <h2 className="font-bold text-lg">HABIT SCORE</h2>
          </div>
        </div>
      </div>
      
      <div className="space-y-5">
        {leaderboardData.map((item) => (
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
