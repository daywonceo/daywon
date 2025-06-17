
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Target, TrendingUp, Plus, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutPlanSelector from "./WorkoutPlanSelector";
import ActiveWorkoutView from "./ActiveWorkoutView";
import WorkoutProgress from "./WorkoutProgress";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";

const NewWorkoutsTab = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'plan-selector' | 'active-workout' | 'progress'>('overview');
  const { user } = useAuth();
  const { workoutPlans, isLoading: plansLoading, error: plansError } = useWorkoutPlans();
  const { sessions, error: sessionsError } = useWorkoutSessions();

  // Show error state if there are authentication or data issues
  if (!user) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className="text-red-800 dark:text-red-400">
            Authentication required to access workout features
          </p>
        </CardContent>
      </Card>
    );
  }

  if (plansError || sessionsError) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <p className="text-yellow-800 dark:text-yellow-400">
            Unable to load workout data. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (currentView === 'plan-selector') {
    return <WorkoutPlanSelector onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'active-workout') {
    return <ActiveWorkoutView onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'progress') {
    return <WorkoutProgress onBack={() => setCurrentView('overview')} />;
  }

  const activePlan = workoutPlans.find(plan => plan.is_active);
  const recentSessions = sessions.slice(0, 3);
  const completedThisWeek = sessions.filter(session => {
    const sessionDate = new Date(session.workout_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo && session.is_completed;
  }).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome Message for First-time Users */}
      {!plansLoading && workoutPlans.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
              Welcome to Your Fitness Journey!
            </h3>
            <p className="text-green-600 dark:text-green-300 mb-4">
              Create your first workout plan to start tracking your progress and achieving your fitness goals.
            </p>
            <Button 
              onClick={() => setCurrentView('plan-selector')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {completedThisWeek}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">This Week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">
              {Math.round(sessions.filter(s => s.duration_minutes).reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / sessions.length) || 0}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Avg Minutes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-400">
              {sessions.filter(s => s.is_completed).length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Total Workouts</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Plan */}
      {activePlan ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                {activePlan.name}
              </CardTitle>
              <Badge variant="default" className="bg-green-600">
                Active Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Split: {activePlan.plan_type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentView('active-workout')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('progress')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !plansLoading && workoutPlans.length > 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No Active Workout Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have workout plans but none are currently active. Select one to get started.
            </p>
            <Button 
              onClick={() => setCurrentView('plan-selector')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Manage Plans
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Workouts */}
      {recentSessions.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.workout_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.duration_minutes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.duration_minutes}min
                    </div>
                  )}
                  <Badge variant={session.is_completed ? "default" : "secondary"}>
                    {session.is_completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('plan-selector')}
          className="h-16 flex flex-col items-center gap-1"
        >
          <Target className="w-5 h-5" />
          <span className="text-xs">{workoutPlans.length > 0 ? 'Manage Plans' : 'Create Plan'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('progress')}
          className="h-16 flex flex-col items-center gap-1"
          disabled={sessions.length === 0}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs">Progress</span>
        </Button>
      </div>
    </div>
  );
};

export default NewWorkoutsTab;
