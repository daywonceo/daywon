import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Timer, Dumbbell, Target, TrendingUp } from "lucide-react";

interface WorkoutDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
}

const WorkoutDetailModal = ({ open, onOpenChange, session }: WorkoutDetailModalProps) => {
  if (!session) return null;

  const formatWorkoutName = (workoutType: string) => {
    return workoutType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' & ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exerciseCount = session.exercise_logs?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span>{formatWorkoutName(session.workout_type)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status and Type */}
          <div className="flex items-center gap-2 flex-wrap">
            {session.is_completed && (
              <Badge variant="default" className="bg-success text-success-foreground">
                Completed
              </Badge>
            )}
            {!session.workout_plan_id && (
              <Badge variant="outline">Manual Workout</Badge>
            )}
          </div>

          {/* Overview Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(session.workout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {session.duration_minutes != null && session.duration_minutes > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Timer className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-semibold">{session.duration_minutes}min</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Target className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Exercises</p>
                  <p className="text-sm font-semibold">{exerciseCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold">
                    {session.is_completed ? 'Done' : 'Pending'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Workout Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Workout Date</span>
                  <span className="text-sm font-medium">{formatDate(session.workout_date)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Created At</span>
                  <span className="text-sm font-medium">{formatTime(session.created_at)}</span>
                </div>

                {session.updated_at !== session.created_at && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">{formatTime(session.updated_at)}</span>
                  </div>
                )}

                {session.planned_day_of_week != null && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Planned Day</span>
                    <span className="text-sm font-medium">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.planned_day_of_week]}
                    </span>
                  </div>
                )}

                {session.notes && (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{session.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Logs */}
          {session.exercise_logs && session.exercise_logs.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Exercises Completed ({exerciseCount})
                </h3>
                
                <div className="space-y-3">
                  {session.exercise_logs.map((log: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{log.exercise_name}</h4>
                          {log.muscle_group && (
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {log.muscle_group.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                        {log.difficulty && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {log.difficulty}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">{log.sets}</strong> sets
                        </span>
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">{log.reps}</strong> reps
                        </span>
                        {log.weight_lbs && (
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">{log.weight_lbs}</strong> lbs
                          </span>
                        )}
                      </div>

                      {log.equipment && (
                        <p className="text-xs text-muted-foreground capitalize">
                          Equipment: {log.equipment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutDetailModal;
