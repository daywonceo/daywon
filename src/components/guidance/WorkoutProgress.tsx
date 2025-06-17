
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Award, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WorkoutProgressProps {
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

const WorkoutProgress = ({ onBack }: WorkoutProgressProps) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
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

  const getProgressRecommendation = (progress: ProgressData) => {
    const daysSinceIncrease = progress.last_increase_date 
      ? Math.floor((Date.now() - new Date(progress.last_increase_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!progress.current_weight_lbs) {
      return { type: 'start', message: 'Start tracking weight for this exercise' };
    }

    if (progress.total_sessions >= 4 && (!daysSinceIncrease || daysSinceIncrease >= 14)) {
      const recommendedIncrease = Math.max(2.5, progress.current_weight_lbs * 0.05);
      return {
        type: 'increase',
        message: `Try adding ${recommendedIncrease.toFixed(1)} lbs`,
        newWeight: progress.current_weight_lbs + recommendedIncrease
      };
    }

    if (progress.total_sessions < 4) {
      return { type: 'consistency', message: `Complete ${4 - progress.total_sessions} more sessions` };
    }

    return { type: 'maintain', message: 'Keep up the current weight' };
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
            Progress Tracking
          </h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          Progress Tracking
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {progressData.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Exercises Tracked</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">
              {progressData.reduce((acc, p) => acc + p.total_sessions, 0)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-400">
              {progressData.filter(p => p.weight_increase_percent > 0).length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Improved Exercises</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress List */}
      {progressData.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No Progress Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start logging your workouts to track your progress over time
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {progressData.map((progress) => {
            const recommendation = getProgressRecommendation(progress);
            
            return (
              <Card key={progress.id} className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                      {progress.exercise_name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {progress.total_sessions} sessions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {progress.current_weight_lbs || 0}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Current Weight (lbs)</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {progress.weight_increase_percent > 0 ? '+' : ''}{progress.weight_increase_percent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className={`p-3 rounded-lg ${
                    recommendation.type === 'increase' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : recommendation.type === 'consistency'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {recommendation.type === 'increase' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {recommendation.type === 'consistency' && <Target className="w-4 h-4 text-blue-600" />}
                      <span className="text-sm font-medium">
                        {recommendation.message}
                      </span>
                    </div>
                    {'newWeight' in recommendation && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Next target: {recommendation.newWeight.toFixed(1)} lbs
                      </div>
                    )}
                  </div>

                  {/* Progress History */}
                  {progress.previous_weight_lbs && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Previous: {progress.previous_weight_lbs} lbs
                      {progress.last_increase_date && (
                        <span className="ml-2">
                          (Last increase: {new Date(progress.last_increase_date).toLocaleDateString()})
                        </span>
                      )}
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

export default WorkoutProgress;
