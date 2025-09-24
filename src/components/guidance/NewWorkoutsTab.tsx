import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutPlanSelector from "./WorkoutPlanSelector";
import ActiveWorkoutView from "./ActiveWorkoutView";
import WorkoutProgress from "./WorkoutProgress";
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
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";

const NewWorkoutsTab = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'plan-selector' | 'active-workout' | 'progress' | 'week-view' | 'schedule-workout' | 'manual-workout'>('overview');
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
    // Always go to active workout view when clicking a workout
    // This allows users to complete or view any workout session
    setCurrentView('active-workout');
  };

  if (currentView === 'plan-selector') {
    return <WorkoutPlanSelector onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'active-workout') {
    return <ActiveWorkoutView onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'progress') {
    return <WorkoutProgress onBack={() => setCurrentView('overview')} />;
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
    <div className="animate-fade-in space-y-6">
      <ActiveWorkoutAlert 
        activeWorkoutSession={activeWorkoutSession}
        onResumeClick={() => setCurrentView('active-workout')}
      />

      {!plansLoading && workoutPlans.length === 0 && (
        <WelcomeCard
          onCreatePlan={() => setCurrentView('plan-selector')}
          onManualWorkout={() => setCurrentView('manual-workout')}
        />
      )}

      <WorkoutStatsCards
        completedThisWeek={completedThisWeek}
        averageMinutes={averageMinutes}
        totalCompletedWorkouts={totalCompletedWorkouts}
      />

      <UpcomingWorkoutsCard upcomingWorkouts={upcomingPlannedWorkouts} />

      <ActivePlanCard
        activePlan={activePlan}
        activeWorkoutSession={activeWorkoutSession}
        onStartWorkout={() => setCurrentView('active-workout')}
        onViewProgress={() => setCurrentView('progress')}
        onManagePlans={() => setCurrentView('plan-selector')}
        hasInactivePlans={!plansLoading && workoutPlans.length > 0}
      />

      <RecentWorkoutsCard 
        recentSessions={recentSessions} 
        onWorkoutClick={handleWorkoutClick}
      />

      <QuickActionsGrid
        workoutPlansCount={workoutPlans.length}
        onManagePlans={() => setCurrentView('plan-selector')}
        onManualWorkout={() => setCurrentView('manual-workout')}
        onWeekView={() => setCurrentView('week-view')}
      />
    </div>
  );
};

export default NewWorkoutsTab;
