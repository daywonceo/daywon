import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp, Square } from "lucide-react";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { format, differenceInMinutes } from "date-fns";
import WorkoutCompletion from "./WorkoutCompletion";
import { toast } from "sonner";

interface WorkoutHistoryProps {
  onBack: () => void;
}

const WorkoutHistory = ({ onBack }: WorkoutHistoryProps) => {
  const { sessions, completeSession } = useWorkoutSessions();
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);
  
  // Show all sessions, but separate active and completed
  const allSessions = [...sessions].sort((a, b) => 
    new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  );
  
  const activeSessions = allSessions.filter(s => !s.is_completed && s.started_at);
  const completedSessions = allSessions.filter(s => s.is_completed);

  const handleEndWorkout = (sessionId: string) => {
    setCompletingSessionId(sessionId);
  };

  const handleCompleteWorkout = async (
    sessionId: string,
    data: {
      energyLevel?: 'low' | 'medium' | 'high';
      rpeOverall?: number;
      workoutQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    }
  ) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.started_at) return;

    // Calculate duration from started_at to now
    const startTime = new Date(session.started_at);
    const now = new Date();
    const durationMinutes = Math.max(1, differenceInMinutes(now, startTime));

    try {
      await completeSession(sessionId, durationMinutes);
      toast.success('Workout completed!');
      setCompletingSessionId(null);
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Failed to complete workout');
    }
  };

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

  // If showing completion screen
  if (completingSessionId) {
    const session = sessions.find(s => s.id === completingSessionId);
    if (!session || !session.started_at) return null;

    const startTime = new Date(session.started_at);
    const now = new Date();
    const elapsedSeconds = Math.max(0, differenceInMinutes(now, startTime) * 60);

    return (
      <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCompletingSessionId(null)} 
            className="h-8 w-8 p-0 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            Complete Workout
          </h2>
        </div>
        <WorkoutCompletion
          elapsedTime={elapsedSeconds}
          onComplete={(data) => handleCompleteWorkout(completingSessionId, data)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 sm:h-10 sm:w-10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg sm:text-xl font-bold text-primary">
          Workout History
        </h2>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">Active Workouts</h3>
          {activeSessions.map((session) => {
            const startTime = session.started_at ? new Date(session.started_at) : null;
            const elapsedMinutes = startTime ? differenceInMinutes(new Date(), startTime) : 0;
            
            return (
              <Card key={session.id} className="glass-card border-primary/30 shadow-lg">
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg text-foreground truncate">
                        {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{format(new Date(session.workout_date), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-xs flex-shrink-0">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {elapsedMinutes} minutes elapsed
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive"
                    className="w-full h-11"
                    onClick={() => handleEndWorkout(session.id)}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Workout
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length === 0 && activeSessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-6 sm:p-8 text-center">
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No Workouts Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete your first workout to see it here
            </p>
          </CardContent>
        </Card>
      ) : completedSessions.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {activeSessions.length > 0 && (
            <h3 className="text-sm font-semibold text-primary mt-6">Completed Workouts</h3>
          )}
          {completedSessions.map((session) => (
            <Card key={session.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg text-foreground truncate">
                      {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{format(new Date(session.workout_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  {session.workout_quality && (
                    <Badge className={`${getQualityColor(session.workout_quality)} text-xs flex-shrink-0`}>
                      {session.workout_quality}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-muted/50 rounded min-w-0">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-primary" />
                    <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {session.duration_minutes || 0}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Minutes</div>
                  </div>
                  
                  {session.energy_level && (
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded min-w-0">
                      <div className="text-base sm:text-lg mb-0.5 sm:mb-1">
                        {getEnergyIcon(session.energy_level)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Energy</div>
                    </div>
                  )}
                  
                  {session.rpe_overall && (
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded min-w-0">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-primary" />
                      <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {session.rpe_overall}/10
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Effort</div>
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-2 sm:p-3 rounded break-words">
                    {session.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default WorkoutHistory;
