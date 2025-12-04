import React, { createContext, useContext, ReactNode } from 'react';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import GuidedTour from '@/components/onboarding/GuidedTour';
import WelcomeModal from '@/components/onboarding/WelcomeModal';

interface GuidedTourContextType {
  startTour: () => void;
  resetTour: () => void;
  hasCompleted: boolean;
}

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(undefined);

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    hasCompleted,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour,
  } = useGuidedTour();

  return (
    <GuidedTourContext.Provider value={{ startTour, resetTour, hasCompleted }}>
      {children}
      <WelcomeModal />
      <GuidedTour
        isActive={isActive}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
      />
    </GuidedTourContext.Provider>
  );
}

export function useGuidedTourContext() {
  const context = useContext(GuidedTourContext);
  if (context === undefined) {
    throw new Error('useGuidedTourContext must be used within a GuidedTourProvider');
  }
  return context;
}
