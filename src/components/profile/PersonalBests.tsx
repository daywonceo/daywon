
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame } from "lucide-react";

interface PersonalBestsProps {
  longestStreak: {
    days: number;
  };
  mostConsistentHabit: string;
}

const PersonalBests = ({ longestStreak, mostConsistentHabit }: PersonalBestsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
        <h3 className="text-lg font-bold">Personal Bests</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <h4 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">LONGEST STREAK</h4>
            <p className="text-2xl font-bold text-orange-600">{longestStreak.days}</p>
            <p className="text-xs text-gray-500">DAYS</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h4 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">TOP HABIT</h4>
            <p className="text-lg font-bold text-blue-600">{mostConsistentHabit}</p>
            <p className="text-xs text-gray-500">MOST CONSISTENT</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalBests;
