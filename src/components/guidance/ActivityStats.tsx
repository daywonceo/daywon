
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Clock, Star } from "lucide-react";

interface ActivityStatsProps {
  completedCount: number;
  totalActivities: number;
  favoriteCount: number;
  todayCount: number;
}

const ActivityStats = ({ completedCount, totalActivities, favoriteCount, todayCount }: ActivityStatsProps) => {
  const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Progress</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Favorites</p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{favoriteCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{todayCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStats;
