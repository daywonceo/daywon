import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { format } from "date-fns";

interface WorkoutHistoryProps {
  onBack: () => void;
}

const WorkoutHistory = ({ onBack }: WorkoutHistoryProps) => {
  const { sessions } = useWorkoutSessions();
  
  const completedSessions = sessions
    .filter(s => s.is_completed)
    .sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime());

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getEnergyIcon = (level?: string) => {
    switch (level) {
      case 'high': return '⚡⚡⚡';
      case 'medium': return '⚡⚡';
      case 'low': return '⚡';
      default: return '–';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-primary">
          Workout History
        </h2>
      </div>

      {completedSessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Workouts Yet
            </h3>
            <p className="text-muted-foreground">
              Complete your first workout to see it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedSessions.map((session) => (
            <Card key={session.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-foreground">
                      {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.workout_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  {session.workout_quality && (
                    <Badge className={getQualityColor(session.workout_quality)}>
                      {session.workout_quality}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <div className="text-sm font-bold text-foreground">
                      {session.duration_minutes || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  
                  {session.energy_level && (
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-lg mb-1">
                        {getEnergyIcon(session.energy_level)}
                      </div>
                      <div className="text-xs text-muted-foreground">Energy</div>
                    </div>
                  )}
                  
                  {session.rpe_overall && (
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <div className="text-sm font-bold text-foreground">
                        {session.rpe_overall}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Effort</div>
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    {session.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
