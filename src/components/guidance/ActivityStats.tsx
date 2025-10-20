
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
            <Trophy className="w-5 h-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-success">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <p className="text-lg font-bold text-primary">{completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Favorites</p>
              <p className="text-lg font-bold text-warning">{favoriteCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-lg font-bold text-accent">{todayCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStats;
