
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, TrendingUp, Target, Zap, Clock } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useHabitScoring } from "@/hooks/useHabitScoring";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type TimePeriod = "weekly" | "monthly" | "yearly";

const HabitLeaderboard = () => {
  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const { leaderboard, userRank, isLoading, refetch } = useLeaderboard(period);
  const { calculateAndSaveAllScores, isLoading: isCalculating } = useHabitScoring();

  const handleRecalculateScores = async () => {
    try {
      await calculateAndSaveAllScores();
      await refetch();
      toast.success("Habit scores updated successfully!");
    } catch (error) {
      toast.error("Failed to update habit scores");
      console.error("Error updating scores:", error);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';  
      case 'yearly': return 'This Year';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full mb-3">
          <Trophy className="text-yellow-600 dark:text-yellow-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Habit Champions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Rankings based on consistency, streaks, variety, and recency
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <ToggleGroup 
            type="single" 
            value={period} 
            onValueChange={(value) => value && setPeriod(value as TimePeriod)} 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <ToggleGroupItem value="weekly" className="text-xs font-medium px-3 py-1.5">Week</ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="text-xs font-medium px-3 py-1.5">Month</ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="text-xs font-medium px-3 py-1.5">Year</ToggleGroupItem>
          </ToggleGroup>
          
          <Button 
            onClick={handleRecalculateScores}
            disabled={isCalculating}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {isCalculating ? "Updating..." : "Update Scores"}
          </Button>
        </div>
      </div>

      {/* User's Current Rank */}
      {userRank && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Rank - {getPeriodLabel(period)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getRankIcon(userRank.rankPosition)}
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">#{userRank.rankPosition}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">out of {leaderboard.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getScoreColor(userRank.totalScore)}`}>
                  {userRank.totalScore.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Habit Score</p>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-3 h-3 text-blue-500 mr-1" />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{userRank.consistencyRate.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Consistency</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-3 h-3 text-orange-500 mr-1" />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{userRank.streakScore.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{userRank.varietyScore.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Variety</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 text-purple-500 mr-1" />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{userRank.recencyScore.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Recency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Leaderboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          All Rankings - {getPeriodLabel(period)}
        </h3>
        
        {leaderboard.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-sm text-gray-500">No rankings available yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete some habits to see your score!</p>
            </CardContent>
          </Card>
        ) : (
          leaderboard.map((entry, index) => (
            <Card 
              key={entry.userId} 
              className={`transition-all duration-200 hover:shadow-md ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800/50' 
                  : entry.userId === userRank?.userId
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200 dark:border-blue-800/50'
                  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Rank Icon */}
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rankPosition)}
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-800/50 flex-shrink-0">
                      <AvatarImage src="" alt={entry.email} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-800 dark:text-blue-200 text-sm font-semibold">
                        {entry.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {entry.email?.split('@')[0] || 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          C: {entry.consistencyRate.toFixed(0)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          S: {entry.streakScore.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`text-xl font-bold ${getScoreColor(entry.totalScore)}`}>
                      {entry.totalScore.toFixed(1)}
                    </p>
                    <div className="w-16">
                      <Progress 
                        value={entry.totalScore} 
                        className="h-1.5 bg-gray-200 dark:bg-gray-600" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HabitLeaderboard;
