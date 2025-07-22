
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/CalendarPage";
import Guidance from "./pages/Guidance";
import GoPremium from "./pages/GoPremium";
import GoOnboarding from "./pages/GoOnboarding";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SavedQuotes from "./pages/SavedQuotes";
import SpotifySuccess from "./pages/SpotifySuccess";
import AllHabits from "./pages/AllHabits";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { OfflineIndicator } from "./utils/offlineStorage";
import { useState, useEffect } from "react";
import OnboardingFlow, { OnboardingData } from "./components/onboarding/OnboardingFlow";
import { useAuth } from "./contexts/AuthContext";
import { useAppTimeTracking } from "./hooks/useAppTimeTracking";
import { useAppSessions } from "./hooks/useAppSessions";

const queryClient = new QueryClient();

// Add CSS variables for animation control based on reduced motion preference
const setupReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || localStorage.getItem('reducedMotion') === 'true') {
    document.documentElement.classList.add('reduce-motion');
    localStorage.setItem('reducedMotion', 'true');
  }
};

// Component that handles time tracking and habit sync integration
const AppIntegrationsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sessionTime, sectionTimes } = useAppTimeTracking();
  const { saveSession } = useAppSessions();
  const { user } = useAuth();
  
  // Initialize habit synchronization
  useEffect(() => {
    // Only initialize sync if user is logged in
    if (user) {
      // Dynamically import to avoid circular dependencies
      import('./utils/habitSynchronization').then(({ initHabitSync, processEndOfDayHabits }) => {
        console.log('Initializing habit synchronization system');
        
        // Initialize synchronization
        const cleanup = initHabitSync();
        
        // Process end-of-day habits
        processEndOfDayHabits();
        
        // Also run end-of-day processing when a new day starts
        const midnightCheck = setInterval(() => {
          const now = new Date();
          // Run at the start of each new day (midnight)
          if (now.getHours() === 0 && now.getMinutes() === 0) {
            processEndOfDayHabits();
          }
        }, 60000); // Check every minute
        
        return () => {
          cleanup();
          clearInterval(midnightCheck);
        };
      });
    }
  }, [user]);
  
  // Save to database periodically
  useEffect(() => {
    if (sessionTime > 0) {
      const interval = setInterval(() => {
        saveSession(sessionTime, sectionTimes);
      }, 60000); // Save every minute
      
      return () => clearInterval(interval);
    }
  }, [sessionTime, sectionTimes, saveSession]);
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setupReducedMotion();
    
    // Check if onboarding should be shown
    if (user && !loading) {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      const shouldShowOnboarding = !onboardingCompleted || onboardingCompleted === 'false';
      setShowOnboarding(shouldShowOnboarding);
    }
  }, [user, loading]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    
    // Save onboarding data to localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    
    // Hide onboarding and show main app
    setShowOnboarding(false);
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show login if not authenticated, but allow access to reset password page
  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Show onboarding only if explicitly requested
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppIntegrationsWrapper>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/social" element={<Social />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/guidance" element={<Guidance />} />
        <Route path="/premium" element={<GoPremium />} />
        <Route path="/onboarding" element={<GoOnboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/saved-quotes" element={<SavedQuotes />} />
        <Route path="/all-habits" element={<AllHabits />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppIntegrationsWrapper>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <OfflineIndicator />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
