
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Dumbbell, Heart, Zap, Calendar, TrendingUp, Activity } from "lucide-react";

interface RecentWorkoutsCardProps {
  recentSessions: any[];
  onWorkoutClick: (session: any) => void;
}

const RecentWorkoutsCard = ({ recentSessions, onWorkoutClick }: RecentWorkoutsCardProps) => {
  // Filter to only show completed workouts and take the 3 most recent
  const recentCompletedWorkouts = recentSessions
    .filter(session => session.is_completed)
    .slice(0, 3);

  if (recentCompletedWorkouts.length === 0) return null;

  const getWorkoutIcon = (workoutType: string) => {
    const type = workoutType.toLowerCase();
    if (type.includes('cardio')) return Heart;
    if (type.includes('upper') || type.includes('push') || type.includes('pull')) return Dumbbell;
    if (type.includes('legs') || type.includes('lower')) return Activity;
    if (type.includes('full')) return Zap;
    return Dumbbell;
  };

  const getWorkoutColor = (workoutType: string) => {
    const type = workoutType.toLowerCase();
    if (type.includes('cardio')) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (type.includes('push') || type.includes('chest')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (type.includes('pull') || type.includes('back')) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    if (type.includes('legs') || type.includes('lower')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    if (type.includes('full')) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    return 'text-primary bg-primary/10';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatWorkoutName = (workoutType: string) => {
    return workoutType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' & ');
  };

  return (
    <Card className="glass-card group relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative">
        <CardTitle className="text-primary flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {recentCompletedWorkouts.map((session, index) => {
          const WorkoutIcon = getWorkoutIcon(session.workout_type);
          const colorClass = getWorkoutColor(session.workout_type);
          const exerciseCount = session.exercise_logs?.length || 0;

          return (
            <div 
              key={session.id} 
              className="group/item relative p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
              onClick={() => onWorkoutClick(session)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top border accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${colorClass.split(' ')[1]} opacity-50 group-hover/item:opacity-100 transition-opacity`}></div>
              
              <div className="flex items-start gap-4">
                {/* Workout Icon */}
                <div className={`p-3 rounded-xl ${colorClass} group-hover/item:scale-110 transition-transform duration-300`}>
                  <WorkoutIcon className="w-5 h-5" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-foreground group-hover/item:text-primary transition-colors leading-snug break-words">
                        {formatWorkoutName(session.workout_type)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{formatDate(session.workout_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {session.duration_minutes != null && session.duration_minutes > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Timer className="w-4 h-4" />
                        <span className="font-medium">{session.duration_minutes}min</span>
                      </div>
                    )}
                    {exerciseCount > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Dumbbell className="w-4 h-4" />
                        <span className="font-medium">{exerciseCount} exercises</span>
                      </div>
                    )}
                    {!session.workout_plan_id && (
                      <Badge variant="outline" className="text-xs">Manual</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentWorkoutsCard;
