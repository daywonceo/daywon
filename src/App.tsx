
import React, { useState, useEffect, lazy, Suspense } from "react";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy load heavy features
const Social = lazy(() => import("./pages/Social"));
const Profile = lazy(() => import("./pages/Profile"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Guidance = lazy(() => import("./pages/Guidance"));
const GoPremium = lazy(() => import("./pages/GoPremium"));
const SavedContent = lazy(() => import("./pages/SavedContent"));
const GoOnboarding = lazy(() => import("./pages/GoOnboarding"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Analytics = lazy(() => import("./pages/Analytics"));
const DataExport = lazy(() => import("./pages/DataExport"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));
const Advanced = lazy(() => import("./pages/Advanced"));
const RedeemInvite = lazy(() => import("./pages/RedeemInvite"));
const SettingsConnections = lazy(() => import("./pages/SettingsConnections"));


import { SettingsProvider } from "./contexts/SettingsContext";
import { HapticsProvider } from "./contexts/HapticsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { OfflineIndicator } from "./utils/offlineStorage";
import SimpleOnboardingFlow from "./components/onboarding/SimpleOnboardingFlow";
import { useAuth } from "./contexts/AuthContext";
import { useAppTimeTracking } from "./hooks/useAppTimeTracking";
import { useAppSessions } from "./hooks/useAppSessions";
import { useAuthErrorHandler } from "./hooks/useAuthErrorHandler";
import { GlobalErrorHandler, errorLogger } from "./components/ErrorLogger";
import { AccessibilityProvider } from "./components/ui/accessibility";
import { performanceMonitor } from "./utils/performanceMonitor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Log errors for monitoring
        if (failureCount === 0) {
          errorLogger.logError(new Error(`Query failed: ${error?.message || 'Unknown error'}`));
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1; // Only retry once for mutations
      },
    },
  },
});

// Add CSS variables for animation control based on reduced motion preference
const setupReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || localStorage.getItem('reducedMotion') === 'true') {
    document.documentElement.classList.add('reduce-motion');
    localStorage.setItem('reducedMotion', 'true');
  }
  
  // Initialize performance monitoring
  performanceMonitor.initialize();
};

// Component that handles time tracking and habit sync integration
const AppIntegrationsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sessionTime, sectionTimes } = useAppTimeTracking();
  const { saveSession } = useAppSessions();
  const { user } = useAuth();
  
  // Add auth error handling
  useAuthErrorHandler();
  
  // Initialize habit synchronization
  useEffect(() => {
    // Only initialize sync if user is logged in
    if (user) {
      // Use the synchronization system
      import('./utils/habitSynchronization').then(({ initHabitSync, processEndOfDayHabits }) => {
        // Initialize synchronization
        const cleanup = initHabitSync();
        
        // Process end-of-day habits for the last 3 days (reduced from 7 to be less aggressive)
        processEndOfDayHabits(3);
        
        // Also run end-of-day processing when a new day starts
        const midnightCheck = setInterval(() => {
          const now = new Date();
          // Run at the start of each new day (midnight to 1 AM)
          if (now.getHours() === 0 && now.getMinutes() < 5) {
            processEndOfDayHabits(1); // Only process yesterday at midnight
          }
        }, 300000); // Check every 5 minutes instead of every minute for better performance
        
        // Also check when app regains focus (user opens app on new day)
        const handleFocus = () => {
          const lastCheck = localStorage.getItem('lastEndOfDayCheck');
          const today = new Date().toISOString().split('T')[0];
          
          if (!lastCheck || lastCheck !== today) {
            processEndOfDayHabits(2); // Only check last 2 days when app regains focus
            localStorage.setItem('lastEndOfDayCheck', today);
          }
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
          cleanup?.();
          clearInterval(midnightCheck);
          window.removeEventListener('focus', handleFocus);
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
  const [checkingHabits, setCheckingHabits] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    setupReducedMotion();
    
    // Check if onboarding should be shown
    const checkOnboardingStatus = async () => {
      if (user && !loading) {
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        const isOnboardingRoute = window.location.pathname === '/onboarding';
        
        // If user is on the /onboarding route, always show it
        if (isOnboardingRoute) {
          setShowOnboarding(true);
          setCheckingHabits(false);
          return;
        }
        
        // Check if user has any existing habits
        try {
          const { data: habits } = await import('./integrations/supabase/client').then(m => 
            m.supabase
              .from('habits')
              .select('id')
              .eq('user_id', user.id)
              .limit(1)
          );
          
          // If user has habits, skip onboarding
          if (habits && habits.length > 0) {
            localStorage.setItem('onboardingCompleted', 'true');
            setShowOnboarding(false);
          } else {
            // New user with no habits - show onboarding if not completed
            const shouldShowOnboarding = !onboardingCompleted || onboardingCompleted === 'false';
            setShowOnboarding(shouldShowOnboarding);
          }
        } catch (error) {
          console.error('Error checking habits:', error);
          // On error, fall back to localStorage check
          const shouldShowOnboarding = !onboardingCompleted || onboardingCompleted === 'false';
          setShowOnboarding(shouldShowOnboarding);
        }
        
        setCheckingHabits(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    // Save onboarding data to localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Hide onboarding and show main app
    setShowOnboarding(false);
  };

  // Show loading while checking auth status or habits
  if (loading || checkingHabits) {
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

  // Show onboarding only if explicitly requested or if accessing /onboarding route
  if (showOnboarding) {
    return <SimpleOnboardingFlow />;
  }

  return (
    <AppIntegrationsWrapper>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/social" element={<Social />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/guidance" element={<Guidance />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/data-export" element={<DataExport />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/advanced" element={<Advanced />} />
          <Route path="/help" element={<Help />} />
          <Route path="/premium" element={<GoPremium />} />
          <Route path="/saved-content" element={<SavedContent />} />
          <Route path="/onboarding" element={<GoOnboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/redeem" element={<RedeemInvite />} />
          <Route path="/settings/connections" element={<SettingsConnections />} />
          
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppIntegrationsWrapper>
  );
};

const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <HapticsProvider>
              <AccessibilityProvider>
                <TooltipProvider>
                  <GlobalErrorHandler />
                  <BrowserRouter>
                    <div id="main-content" role="main">
                      <Toaster />
                      <Sonner />
                      <OfflineIndicator />
                      <AppContent />
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </AccessibilityProvider>
            </HapticsProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
