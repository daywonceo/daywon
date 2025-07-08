import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SignUpScreen from "./SignUpScreen";
import WelcomeScreen from "./WelcomeScreen";
import MissionCanvasScreen from "./MissionCanvasScreen";
import PickFocusScreen from "./PickFocusScreen";
import NotificationScreen from "./NotificationScreen";
import IntentScreen from "./IntentScreen";
import FinalScreen from "./FinalScreen";

export interface OnboardingData {
  focusAreas: string[];
  notifications: {
    enabled: boolean;
    reminderTime: string;
  };
  intent: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    focusAreas: [],
    notifications: { enabled: false, reminderTime: "09:00" },
    intent: ""
  });

  const totalSteps = 7;

  const updateData = (key: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipToEnd = () => {
    onComplete(onboardingData);
  };

  const handleComplete = () => {
    onComplete(onboardingData);
  };

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 0:
        return <SignUpScreen onNext={nextStep} onSkip={skipToEnd} />;
      case 1:
        return <WelcomeScreen onNext={nextStep} onSkip={skipToEnd} />;
      case 2:
        return (
          <MissionCanvasScreen
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipToEnd}
          />
        );
      case 3:
        return (
          <PickFocusScreen
            selectedAreas={onboardingData.focusAreas}
            onSelectionChange={(areas) => updateData('focusAreas', areas)}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipToEnd}
          />
        );
      case 4:
        return (
          <NotificationScreen
            preferences={onboardingData.notifications}
            onPreferencesChange={(prefs) => updateData('notifications', prefs)}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipToEnd}
          />
        );
      case 5:
        return (
          <IntentScreen
            intent={onboardingData.intent}
            onIntentChange={(intent) => updateData('intent', intent)}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipToEnd}
          />
        );
      case 6:
        return (
          <FinalScreen
            onComplete={handleComplete}
            onBack={prevStep}
            data={onboardingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
        <div 
          className="h-1 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center pt-4 pb-2">
        <Badge variant="outline" className="text-sm">
          Step {currentStep + 1} of {totalSteps}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        {renderCurrentScreen()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
