
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
    if (rank === 1) return <Crown className="text-yellow-500 dark:text-yellow-400" size={20} />;
    if (rank === 2) return <Trophy className="text-slate-500 dark:text-slate-400" size={18} />;
    if (rank === 3) return <Medal className="text-amber-600 dark:text-amber-400" size={18} />;
    return (
      <div className="w-7 h-7 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full flex items-center justify-center border border-border">
        <span className="font-bold text-sm text-muted-foreground">{rank}</span>
      </div>
    );
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-slate-400 to-slate-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-orange-400 text-white";
    return "bg-gradient-to-r from-muted to-muted-foreground/20 text-muted-foreground";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';  
      case 'yearly': return 'This Year';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 pb-20">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl rounded-full transform scale-150"></div>
          <div className="relative inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
            <Trophy className="text-white" size={20} />
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Champions Arena
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Where dedication meets recognition
          </p>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={period} 
          onValueChange={(value) => value && setPeriod(value as TimePeriod)} 
          className="bg-card border rounded-xl p-1 shadow-sm w-full max-w-xs mx-auto"
        >
          <ToggleGroupItem value="weekly" className="text-xs sm:text-sm font-medium px-3 sm:px-6 py-2 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Week</ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-xs sm:text-sm font-medium px-3 sm:px-6 py-2 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Month</ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="text-xs sm:text-sm font-medium px-3 sm:px-6 py-2 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Year</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* User's Current Rank */}
      {userRank && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getRankBadge(userRank.rankPosition)} shadow-lg`}>
                    {getRankIcon(userRank.rankPosition)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">#{userRank.rankPosition}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Your Position</p>
                  <p className="text-base sm:text-lg font-bold">Rank #{userRank.rankPosition} of {leaderboard.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(userRank.totalScore)}`}>
                  {userRank.totalScore.toFixed(1)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Habit Score</p>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Consistency</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-primary">{userRank.consistencyRate.toFixed(0)}%</span>
                </div>
                <Progress value={userRank.consistencyRate} className="mt-2 h-2" />
              </div>
              <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-accent">{userRank.streakScore.toFixed(0)}</span>
                </div>
                <Progress value={userRank.streakScore * 4} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6">
        {leaderboard.slice(0, 3).map((entry, index) => {
          const heights = ["h-16 sm:h-24", "h-20 sm:h-32", "h-14 sm:h-20"];
          const positions = [1, 0, 2]; // 2nd, 1st, 3rd
          const actualIndex = positions[index];
          const actualEntry = leaderboard[actualIndex];
          
          return (
            <div key={actualEntry.userId} className="flex flex-col items-center">
              <Avatar className={`mb-1 sm:mb-2 ${actualIndex === 0 ? 'h-12 w-12 sm:h-16 sm:w-16' : 'h-8 w-8 sm:h-12 sm:w-12'} ring-1 sm:ring-2 ${actualIndex === 0 ? 'ring-yellow-400' : actualIndex === 1 ? 'ring-slate-400' : 'ring-amber-400'}`}>
                <AvatarImage src={actualEntry.avatar} alt={actualEntry.name} />
                <AvatarFallback className={`font-bold text-xs sm:text-base ${actualIndex === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' : actualIndex === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' : 'bg-gradient-to-br from-amber-400 to-orange-400 text-white'}`}>
                  {actualEntry.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`${heights[actualIndex]} w-full bg-gradient-to-t ${
                actualIndex === 0 ? 'from-yellow-400 to-yellow-500' : 
                actualIndex === 1 ? 'from-slate-400 to-slate-500' : 
                'from-amber-400 to-amber-500'
              } rounded-t-lg flex flex-col items-center justify-center text-white relative`}>
                <div className="absolute -top-1 sm:-top-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-background to-muted rounded-full flex items-center justify-center border border-current sm:border-2">
                  <span className="text-xs font-bold text-current">{actualIndex + 1}</span>
                </div>
                <div className="text-center mt-1 sm:mt-2 px-1">
                  <p className="text-xs font-medium truncate">{actualEntry.name.split(' ')[0]}</p>
                  <p className="text-sm sm:text-lg font-bold">{actualEntry.totalScore.toFixed(0)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2 mb-3 sm:mb-4 px-1">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span>Full Rankings - {getPeriodLabel(period)}</span>
        </h3>
        
        {leaderboard.slice(0, 10).map((entry, index) => (
          <Card 
            key={entry.userId} 
            className={`group transition-all duration-300 hover:shadow-lg ${
              index < 3 
                ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-md' 
                : entry.name === userRank?.name
                ? 'bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 shadow-md'
                : 'bg-card hover:bg-accent/5'
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${getRankBadge(entry.rankPosition)} shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  #{entry.rankPosition}
                </div>
                
                {/* Avatar */}
                <Avatar className="h-8 w-8 sm:h-12 sm:w-12 ring-1 sm:ring-2 ring-border group-hover:ring-primary/50 transition-all flex-shrink-0">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-xs sm:text-base">
                    {entry.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <p className="font-bold text-foreground truncate text-sm sm:text-base">
                      {entry.name}
                    </p>
                    {index < 3 && (
                      <div className="flex-shrink-0 hidden sm:block">
                        {getRankIcon(entry.rankPosition)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 mt-0.5 sm:mt-1">
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{entry.consistencyRate.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-xs text-muted-foreground">{entry.streakScore.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg sm:text-2xl font-bold ${getScoreColor(entry.totalScore)}`}>
                    {entry.totalScore.toFixed(1)}
                  </p>
                  <div className="w-12 sm:w-20 mt-1">
                    <Progress 
                      value={entry.totalScore} 
                      className="h-1.5 sm:h-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scoring Formula */}
      <Card className="bg-gradient-to-br from-muted/30 to-accent/10 border-muted">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
            Scoring System
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Consistency</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">40% weight</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Key Factor</Badge>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Streak Power</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">30% weight</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">High Impact</Badge>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Variety</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">20% weight</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Balanced</Badge>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Recency</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">10% weight</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Bonus</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs sm:text-sm text-center font-medium">
              <span className="text-primary">Score Formula:</span> (Consistency × 0.4) + (Streak × 0.3) + (Variety × 0.2) + (Recency × 0.1)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitLeaderboard;
