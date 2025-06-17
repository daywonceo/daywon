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

  // Filter sessions to only include today or earlier dates, and ensure future workouts aren't marked as in progress
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.workout_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return sessionDate <= today;
  });

  // Find active workout session (not completed and from today only)
  const activeWorkoutSession = filteredSessions.find(session => {
    const sessionDate = new Date(session.workout_date);
    const today = new Date();
    const isToday = sessionDate.toDateString() === today.toDateString();
    return !session.is_completed && isToday;
  });

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

  const handleWorkoutClick = (session: any) => {
    // If the workout is not completed (in progress), go to active workout view
    if (!session.is_completed) {
      setCurrentView('active-workout');
    }
    // If completed, we could show workout details in the future
    // For now, just navigate to active workout for any clicked workout
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
            className="text-green-600 hover:text-green-700"
          >
            ← Back to Overview
          </button>
          <button
            onClick={() => setCurrentView('schedule-workout')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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
  const recentSessions = filteredSessions.slice(0, 3);
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
