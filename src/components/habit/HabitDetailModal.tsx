
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar, CheckCircle, XCircle } from "lucide-react";
import { HabitStats } from "@/utils/habitStats";
import { capitalizeHabitName } from "@/lib/utils";

interface HabitDetailModalProps {
  habit: HabitStats | null;
  isOpen: boolean;
  onClose: () => void;
  timeframe: "week" | "month" | "year";
}

const HabitDetailModal = ({ habit, isOpen, onClose, timeframe }: HabitDetailModalProps) => {
  if (!habit) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'bad': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'good': return 'Good Habit';
      case 'bad': return 'Bad Habit';
      case 'in-progress': return 'In Progress';
      default: return 'Uncategorized';
    }
  };

  const getImprovementSuggestions = () => {
    if (habit.category === 'good') {
      return [
        "Keep up the excellent work! You're building a strong habit.",
        "Consider increasing the difficulty or frequency to challenge yourself further.",
        "Share your success strategy with others to help them improve."
      ];
    } else if (habit.category === 'bad') {
      return [
        "Start small - aim for just 2-3 days per week initially.",
        "Set up environmental cues and reminders to help you remember.",
        "Identify what's preventing you from completing this habit and address those barriers.",
        "Consider pairing this habit with something you already do consistently."
      ];
    } else {
      return [
        "You're making progress! Focus on consistency over perfection.",
        "Try to identify patterns in when you succeed vs when you struggle.",
        "Consider adjusting the habit to make it slightly easier to maintain momentum.",
        "Celebrate small wins to build positive associations with this habit."
      ];
    }
  };

  const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{capitalizeHabitName(habit.habitName)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Badge */}
          <div className="flex justify-center">
            <Badge className={`${getCategoryColor(habit.category)} px-3 py-1 text-sm font-medium`}>
              {getCategoryLabel(habit.category)}
            </Badge>
          </div>

          {/* Main Stats */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {habit.percentage}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate ({timeframe})
                </p>
              </div>
              
              <Progress 
                value={habit.percentage} 
                className="h-3"
                useGradient={habit.category === 'good'}
              />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="font-semibold text-green-600">{habit.completed}</span>
                  </div>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    <span className="font-semibold text-red-600">{habit.failed}</span>
                  </div>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="font-semibold text-gray-600">{habit.total}</span>
                  </div>
                  <p className="text-xs text-gray-500">Total Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Target className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Improvement Tips
                </h3>
              </div>
              <ul className="space-y-2">
                {getImprovementSuggestions().map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Goal Targets */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Next Milestone</h3>
              {habit.category === 'good' ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Maintain your excellent streak!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target: 70% completion</span>
                    <span>{Math.max(0, Math.ceil((70 - habit.percentage) / 100 * timeframeDays))} more days needed</span>
                  </div>
                  <Progress value={(habit.percentage / 70) * 100} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitDetailModal;
