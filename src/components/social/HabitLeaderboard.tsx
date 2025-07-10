
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, TrendingUp, Target, Zap, Clock } from "lucide-react";
import { mockUsers } from "@/components/social/mockSocialData";

type TimePeriod = "weekly" | "monthly" | "yearly";

// Generate mock leaderboard data based on mockUsers
const generateMockLeaderboard = (period: TimePeriod) => {
  return mockUsers
    .map((user, index) => ({
      userId: user.userId,
      email: user.name.toLowerCase().replace(' ', '') + '@example.com',
      name: user.name,
      avatar: user.profileImage,
      totalScore: Math.max(45, 95 - (index * 8) + Math.random() * 10),
      consistencyRate: Math.max(40, 90 - (index * 7) + Math.random() * 15),
      streakScore: Math.max(5, 25 - (index * 2) + Math.random() * 8),
      varietyScore: Math.max(8, 20 - (index * 1.5) + Math.random() * 6),
      recencyScore: Math.random() > 0.3 ? 10 : Math.random() * 5,
      rankPosition: index + 1,
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0]
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((entry, index) => ({ ...entry, rankPosition: index + 1 }));
};

const HabitLeaderboard = () => {
  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const leaderboard = generateMockLeaderboard(period);
  const userRank = leaderboard.find(entry => entry.name === "Sarah Chen"); // Mock current user

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
        
        <ToggleGroup 
          type="single" 
          value={period} 
          onValueChange={(value) => value && setPeriod(value as TimePeriod)} 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <ToggleGroupItem value="weekly" className="text-sm font-semibold px-4 py-2.5">Week</ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-sm font-semibold px-4 py-2.5">Month</ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="text-sm font-semibold px-4 py-2.5">Year</ToggleGroupItem>
        </ToggleGroup>
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
        
        {leaderboard.map((entry, index) => (
          <Card 
            key={entry.userId} 
            className={`transition-all duration-200 hover:shadow-md ${
              index < 3 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800/50' 
                : entry.name === userRank?.name
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
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-800 dark:text-blue-200 text-sm font-semibold">
                      {entry.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {entry.name}
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
        ))}
      </div>

      {/* Scoring Formula */}
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-blue-500" />
            How Your Habit Score is Calculated
          </h4>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Target className="w-3 h-3 text-blue-500 mr-2" />
                <strong>Consistency Rate (40%)</strong>
              </span>
              <span>Days completed ÷ Total days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="w-3 h-3 text-orange-500 mr-2" />
                <strong>Streak Score (30%)</strong>
              </span>
              <span>Current streak × difficulty multiplier</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-3 h-3 text-green-500 mr-2" />
                <strong>Variety Score (20%)</strong>
              </span>
              <span>Number of different habits tracked</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-3 h-3 text-purple-500 mr-2" />
                <strong>Recency Bonus (10%)</strong>
              </span>
              <span>Activity in the last 7 days</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <strong>Total Score = </strong>(Consistency × 0.4) + (Streak × 0.3) + (Variety × 0.2) + (Recency × 0.1)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitLeaderboard;
