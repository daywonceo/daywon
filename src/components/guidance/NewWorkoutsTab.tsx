import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Target, Clock, TrendingUp, Calendar, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutPlanSelector from "./WorkoutPlanSelector";
import ActiveWorkoutView from "./ActiveWorkoutView";
import EnhancedWorkoutProgress from "./EnhancedWorkoutProgress";
import WorkoutHistory from "./WorkoutHistory";
import { WorkoutTemplatesLibrary } from "./WorkoutTemplatesLibrary";
import WeekViewCalendar from "./WeekViewCalendar";
import PlannedWorkoutForm from "./PlannedWorkoutForm";
import ManualWorkoutCreator from "./ManualWorkoutCreator";
import WorkoutStatsCards from "./WorkoutStatsCards";
import ActiveWorkoutAlert from "./ActiveWorkoutAlert";
import WelcomeCard from "./WelcomeCard";
import ActivePlanCard from "./ActivePlanCard";
import UpcomingWorkoutsCard from "./UpcomingWorkoutsCard";
import RecentWorkoutsCard from "./RecentWorkoutsCard";
import QuickActionsGrid from "./QuickActionsGrid";
import WorkoutDetailModal from "./WorkoutDetailModal";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";

const NewWorkoutsTab = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'plan-selector' | 'active-workout' | 'progress' | 'history' | 'templates' | 'week-view' | 'schedule-workout' | 'manual-workout'>('overview');
  const [selectedWorkoutForDetail, setSelectedWorkoutForDetail] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  const { user } = useAuth();
  const { workoutPlans, isLoading: plansLoading, error: plansError } = useWorkoutPlans();
  const { sessions, error: sessionsError, getPlannedWorkoutsForWeek, getCurrentWeekPlannedWorkouts } = useWorkoutSessions();


  // Filter sessions to only include today or earlier dates
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.workout_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return sessionDate <= today;
  });

  // Find active workout session - only show if there's a truly active workout
  const activeWorkoutSession = filteredSessions.find(session => {
    if (session.is_completed) return false;
    
    // Check if workout has actually started (has duration or was created today and has activity)
    const sessionDate = new Date(session.workout_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only consider it active if:
    // 1. It has duration (timer was started), OR
    // 2. It was created today and is not completed
    return (session.duration_minutes && session.duration_minutes > 0) || 
           (sessionDate >= today && !session.is_completed);
  });

  // Show error state if there are authentication or data issues
  if (!user) {
    return (
      <Card className="glass-card border-destructive/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive-foreground">
            Authentication required to access workout features
          </p>
        </CardContent>
      </Card>
    );
  }

  // Provide more specific error messages
  if (plansError || sessionsError) {
    console.error('Workout data errors:', { plansError, sessionsError });
    return (
      <Card className="glass-card border-completion-medium/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-completion-medium" />
          <div className="space-y-2">
            <p className="text-foreground font-medium">
              Unable to load workout data
            </p>
            {plansError && (
              <p className="text-sm text-muted-foreground">
                Plans error: {plansError}
              </p>
            )}
            {sessionsError && (
              <p className="text-sm text-muted-foreground">
                Sessions error: {sessionsError}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page or check your internet connection.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (plansLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">
            Loading workout data...
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleWorkoutClick = (session: any) => {
    // Open workout detail modal to show comprehensive information
    setSelectedWorkoutForDetail(session);
  };

  if (currentView === 'plan-selector') {
    return <WorkoutPlanSelector onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'active-workout') {
    return <ActiveWorkoutView onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'progress') {
    return <EnhancedWorkoutProgress onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'history') {
    return <WorkoutHistory onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'templates') {
    return (
      <div className="animate-fade-in space-y-6">
        <WorkoutTemplatesLibrary 
          onSelectTemplate={(template) => {
            console.log('Selected template:', template);
            setCurrentView('overview');
          }}
        />
        <button
          onClick={() => setCurrentView('overview')}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to Overview
        </button>
      </div>
    );
  }

  if (currentView === 'manual-workout') {
    return <ManualWorkoutCreator onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'week-view') {
    const plannedWorkouts = getPlannedWorkoutsForWeek(currentWeekStart);
    
    const handleWeekChange = (direction: 'prev' | 'next') => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeekStart(newWeekStart);
    };

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('overview')}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Overview
          </button>
          <button
            onClick={() => setCurrentView('schedule-workout')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded transition-colors"
          >
            + Schedule Workout
          </button>
        </div>
        
        <WeekViewCalendar
          plannedWorkouts={plannedWorkouts}
          currentWeekStart={currentWeekStart}
          onWeekChange={handleWeekChange}
          onWorkoutClick={(workout) => {
            console.log('Workout clicked:', workout);
            // Future: Navigate to workout details
          }}
        />
      </div>
    );
  }

  if (currentView === 'schedule-workout') {
    return (
      <div className="animate-fade-in">
        <PlannedWorkoutForm
          onClose={() => setCurrentView('week-view')}
          onSuccess={() => setCurrentView('week-view')}
        />
      </div>
    );
  }

  const activePlan = workoutPlans.find(plan => plan.is_active);
  
  // Show recent sessions (including incomplete ones) for visibility
  const recentSessions = filteredSessions.slice(0, 5); // Show more recent sessions
  
  const completedThisWeek = filteredSessions.filter(session => {
    const sessionDate = new Date(session.workout_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo && session.is_completed;
  }).length;

  // Get current week planned workouts for dashboard highlight
  const currentWeekPlanned = getCurrentWeekPlannedWorkouts();
  const upcomingPlannedWorkouts = currentWeekPlanned.filter(workout => {
    const workoutDate = new Date(workout.workout_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workoutDate >= today && !workout.is_completed;
  });

  // Calculate stats
  const averageMinutes = Math.round(filteredSessions.filter(s => s.duration_minutes).reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / filteredSessions.length) || 0;
  const totalCompletedWorkouts = filteredSessions.filter(s => s.is_completed).length;

  return (
    <div className="animate-fade-in space-y-6 pb-6">
      {/* Hero Section with Active Workout Alert */}
      {activeWorkoutSession && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Active Workout</span>
            </div>
            <h3 className="text-xl font-bold mb-1">
              {activeWorkoutSession.workout_type.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Continue where you left off
            </p>
            <Button 
              onClick={() => setCurrentView('active-workout')}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Resume Workout
            </Button>
          </div>
        </div>
      )}

      {/* Welcome Card - Only show if no plans */}
      {!plansLoading && workoutPlans.length === 0 && !activeWorkoutSession && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Start Your Fitness Journey</h2>
            <p className="text-white/90 mb-6">Create a workout plan or jump right into training</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setCurrentView('plan-selector')}
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
              >
                Create Workout Plan
              </Button>
              <Button 
                onClick={() => setCurrentView('manual-workout')}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Quick Manual Workout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
          <CardContent className="p-4 text-center relative z-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full blur-3xl opacity-40 -mr-10 -mt-10"></div>
            <Target className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-300">
              {completedThisWeek}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">This Week</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-4 text-center relative z-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-success/20 rounded-full blur-3xl opacity-40 -mr-10 -mt-10"></div>
            <Clock className="w-6 h-6 mx-auto mb-2 text-success" />
            <div className="text-2xl sm:text-3xl font-bold text-success">
              {averageMinutes}
            </div>
            <div className="text-xs text-success font-medium">Avg Min</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-4 text-center relative z-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-success/20 rounded-full blur-3xl opacity-40 -mr-10 -mt-10"></div>
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
            <div className="text-2xl sm:text-3xl font-bold text-success">
              {totalCompletedWorkouts}
            </div>
            <div className="text-xs text-success font-medium">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Plan Section */}
      {activePlan && (
        <Card className="border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-muted-foreground">Active Plan</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {activePlan.plan_type.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activePlan.name}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('plan-selector')}
              >
                Change
              </Button>
            </div>
            <Button 
              onClick={() => setCurrentView('active-workout')}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
              size="lg"
            >
              Start Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentView('progress')}
          className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <TrendingUp className="w-6 h-6 text-primary" />
          <span className="font-semibold">Track Progress</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setCurrentView('history')}
          className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Calendar className="w-6 h-6 text-primary" />
          <span className="font-semibold">History</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setCurrentView('week-view')}
          className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Calendar className="w-6 h-6 text-primary" />
          <span className="font-semibold">Week View</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setCurrentView('templates')}
          className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="font-semibold">Templates</span>
        </Button>
      </div>

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentSessions.slice(0, 3).map((session) => (
              <Card 
                key={session.id}
                onClick={() => handleWorkoutClick(session)}
                className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-muted/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {session.workout_type.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.workout_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      {session.is_completed ? (
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          {session.duration_minutes || 0} min
                        </Badge>
                      ) : (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <WorkoutDetailModal
        open={!!selectedWorkoutForDetail}
        onOpenChange={(open) => !open && setSelectedWorkoutForDetail(null)}
        session={selectedWorkoutForDetail}
      />
    </div>
  );
};

export default NewWorkoutsTab;
