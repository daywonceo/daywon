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
import { SettingsProvider } from "./contexts/SettingsContext";
import { OfflineIndicator } from "./utils/offlineStorage";
import { useState, useEffect } from "react";
import OnboardingFlow, { OnboardingData } from "./components/onboarding/OnboardingFlow";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

// Add CSS variables for animation control based on reduced motion preference
const setupReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || localStorage.getItem('reducedMotion') === 'true') {
    document.documentElement.classList.add('reduce-motion');
    localStorage.setItem('reducedMotion', 'true');
  }
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    setupReducedMotion();
    
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    
    // Save onboarding data to localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    
    // Hide onboarding and show main app
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
  };

  // Show onboarding if not completed
  if (showOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </TooltipProvider>
        </SettingsProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/social" element={<Social />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/guidance" element={<Guidance />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
