
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, TrendingUp, Clock, Info } from "lucide-react";

const ScoreCalculationInfo = () => {
  const scoreComponents = [
    {
      name: "Consistency Rate",
      weight: 45,
      icon: Target,
      color: "text-blue-500",
      description: "% of days habits completed in the period",
      example: "28/30 days = 93.3%"
    },
    {
      name: "Streak Score", 
      weight: 25,
      icon: Zap,
      color: "text-orange-500",
      description: "Longest active streak (max 100 days)",
      example: "15 day streak = 15 points"
    },
    {
      name: "Variety Score",
      weight: 20, 
      icon: TrendingUp,
      color: "text-green-500",
      description: "Distinct habits completed this week (max 10)",
      example: "7 different habits = 70 points"
    },
    {
      name: "Recency Score",
      weight: 10,
      icon: Clock,
      color: "text-purple-500", 
      description: "Bonus for completing habits in last 7 days",
      example: "Recent activity = 100 points"
    }
  ];

  const difficultyLevels = [
    {
      level: "High Difficulty",
      multiplier: "1.25x",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      habits: ["Workout", "No Sugar", "Journal", "Yoga", "Sleep 8 Hours"]
    },
    {
      level: "Medium Difficulty", 
      multiplier: "1.0x",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      habits: ["Read", "Devotions", "Morning Walk", "Gratitude Journal", "Focus Work"]
    },
    {
      level: "Low Difficulty",
      multiplier: "0.75x", 
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      habits: ["Drink Water", "Take Vitamins", "Stretch", "Go Outside", "Family Time"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
          <Info className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How Habit Scores Work</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your Habit Score is calculated using four key components
        </p>
      </div>

      {/* Score Formula */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-center text-blue-700 dark:text-blue-300">
            Habit Score Formula (0-100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoreComponents.map((component, index) => {
              const IconComponent = component.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className={`w-5 h-5 ${component.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {component.name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {component.weight}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {component.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                        {component.example}
                      </p>
                    </div>
                  </div>
                  <div className="w-20">
                    <Progress value={component.weight} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Multipliers */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-gray-700 dark:text-gray-300">
            Difficulty Multipliers
          </CardTitle>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Harder habits contribute more to your consistency and streak scores
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {difficultyLevels.map((level, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {level.level}
                  </h4>
                  <Badge className={level.color}>
                    {level.multiplier}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {level.habits.map((habit, habitIndex) => (
                    <Badge key={habitIndex} variant="outline" className="text-xs">
                      {habit}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{5 - level.habits.length} more
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Calculation */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
        <CardHeader>
          <CardTitle className="text-center text-green-700 dark:text-green-300">
            Example Score Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Consistency: 85% × 45%</span>
              <span className="font-semibold text-gray-900 dark:text-white">38.3 points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Streak: 20 days × 25%</span>
              <span className="font-semibold text-gray-900 dark:text-white">5.0 points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Variety: 8 habits × 20%</span>
              <span className="font-semibold text-gray-900 dark:text-white">16.0 points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Recency: Active × 10%</span>
              <span className="font-semibold text-gray-900 dark:text-white">10.0 points</span>
            </div>
            <hr className="border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total Habit Score</span>
              <span className="text-green-600 dark:text-green-400">69.3 / 100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreCalculationInfo;
