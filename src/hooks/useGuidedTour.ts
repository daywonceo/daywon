import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'add-habit',
    target: '[aria-label="Add new habit"]',
    title: 'Add Your Habits',
    description: 'Tap here to add new habits you want to track. Start small with 1-3 habits!',
    placement: 'bottom',
  },
  {
    id: 'theme-toggle',
    target: '[aria-label="Toggle theme"]',
    title: 'Customize Your Look',
    description: 'Switch between light and dark mode to match your preference.',
    placement: 'bottom',
  },
  {
    id: 'navigation',
    target: 'nav',
    title: 'Navigate Your Journey',
    description: 'Use the bottom navigation to access Home, Social, Guidance, and Profile sections.',
    placement: 'top',
  },
];

const STORAGE_KEY = 'guided_tour_completed';

export function useGuidedTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const currentStep = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback((markComplete = true) => {
    setIsActive(false);
    setCurrentStepIndex(0);
    if (markComplete) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setHasCompleted(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      endTour(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    endTour(true);
  }, [endTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCompleted(false);
    setCurrentStepIndex(0);
  }, []);

  // Don't auto-start tour - WelcomeModal handles the initial prompt
  // Tour can be started via WelcomeModal or Profile settings

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    hasCompleted,
    startTour,
    endTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour,
  };
}
