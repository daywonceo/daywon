import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Award, Target, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedWorkoutProgressProps {
  onBack: () => void;
}

interface ProgressData {
  id: string;
  exercise_name: string;
  current_weight_lbs: number;
  previous_weight_lbs: number;
  weight_increase_percent: number;
  last_increase_date: string;
  total_sessions: number;
}

interface ExerciseHistory {
  date: string;
  weight: number;
  sets: number;
  reps: number;
  rpe?: number;
}

const EnhancedWorkoutProgress = ({ onBack }: EnhancedWorkoutProgressProps) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('total_sessions', { ascending: false });

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      setProgressData(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExerciseHistory = async (exerciseName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('created_at, weight_lbs, sets, reps, rpe')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const history: ExerciseHistory[] = (data || []).map(log => ({
        date: new Date(log.created_at).toLocaleDateString(),
        weight: log.weight_lbs || 0,
        sets: log.sets,
        reps: log.reps,
        rpe: log.rpe || undefined
      }));

      setExerciseHistory(history);
    } catch (err) {
      console.error('Error fetching exercise history:', err);
    }
  };

  const getProgressRecommendation = (progress: ProgressData) => {
    const daysSinceIncrease = progress.last_increase_date 
      ? Math.floor((Date.now() - new Date(progress.last_increase_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!progress.current_weight_lbs) {
      return { type: 'start', message: 'Start tracking weight', color: 'text-blue-600' };
    }

    if (progress.total_sessions >= 4 && (!daysSinceIncrease || daysSinceIncrease >= 14)) {
      const recommendedIncrease = Math.max(2.5, progress.current_weight_lbs * 0.05);
      return {
        type: 'increase',
        message: `Try adding ${recommendedIncrease.toFixed(1)} lbs`,
        newWeight: progress.current_weight_lbs + recommendedIncrease,
        color: 'text-green-600'
      };
    }

    if (progress.total_sessions < 4) {
      return { type: 'consistency', message: `${4 - progress.total_sessions} more sessions`, color: 'text-yellow-600' };
    }

    return { type: 'maintain', message: 'Maintain current weight', color: 'text-gray-600' };
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 sm:h-10 sm:w-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            Progress Tracking
          </h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 sm:p-6">
                <div className="animate-pulse space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
          Progress Tracking
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {progressData.length}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Exercises</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {progressData.reduce((acc, p) => acc + p.total_sessions, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4 text-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {progressData.filter(p => p.weight_increase_percent > 0).length}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Improved</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress List */}
      {progressData.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-6 sm:p-8 text-center">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No Progress Data Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start logging workouts to track progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {progressData.map((progress) => {
            const recommendation = getProgressRecommendation(progress);
            const isSelected = selectedExercise === progress.exercise_name;
            
            return (
              <Card 
                key={progress.id} 
                className="glass-card cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
                onClick={() => {
                  setSelectedExercise(isSelected ? null : progress.exercise_name);
                  if (!isSelected) fetchExerciseHistory(progress.exercise_name);
                }}
              >
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base sm:text-lg text-foreground break-words flex-1">
                      {progress.exercise_name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {progress.total_sessions} sessions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {progress.current_weight_lbs || 0}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Current (lbs)</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {progress.weight_increase_percent > 0 ? '+' : ''}{progress.weight_increase_percent.toFixed(1)}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Progress</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <LineChart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className={`${recommendation.color} break-words`}>
                      {recommendation.message}
                    </span>
                  </div>

                  {isSelected && exerciseHistory.length > 0 && (
                    <div className="mt-3 sm:mt-4 space-y-2 border-t pt-3 sm:pt-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground">Recent History</h4>
                      {exerciseHistory.map((log, idx) => (
                        <div key={idx} className="flex justify-between text-xs sm:text-sm bg-muted/30 p-2 rounded gap-2">
                          <span className="text-muted-foreground truncate">{log.date}</span>
                          <span className="text-foreground flex-shrink-0">
                            {log.weight}lbs × {log.sets}×{log.reps}
                            {log.rpe && ` • RPE ${log.rpe}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedWorkoutProgress;
