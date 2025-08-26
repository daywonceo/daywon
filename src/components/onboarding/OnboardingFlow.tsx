import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { useUserHabits } from "@/hooks/useUserHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
import SignUpScreen from "./SignUpScreen";
import IntentScreen from "./IntentScreen";
import PickFocusScreen from "./PickFocusScreen";
import ChooseHabitsScreen from "./ChooseHabitsScreen";
import CadenceSelectionScreen from "./CadenceSelectionScreen";
import HabitSuggestionScreen from "./HabitSuggestionScreen";
import FrequencySelectionScreen, { type HabitFrequency } from "./FrequencySelectionScreen";
import NotificationScreen from "./NotificationScreen";
import MissionScreen from "./MissionScreen";
import MissionCanvasScreen from "./MissionCanvasScreen";
import CanvasGrowthScreen from "./CanvasGrowthScreen";
import FinalScreen from "./FinalScreen";

export default function OnboardingFlow() {
  const { user } = useAuth();
  const { addHabit } = useHabits();
  const { createUserHabit } = useUserHabits();
  const [currentStep, setCurrentStep] = useState(() => {
    return localStorage.getItem('onboarding_step') || 'welcome';
  });
  
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [habitFrequencies, setHabitFrequencies] = useState<Record<string, HabitFrequency>>({});
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [cadence, setCadence] = useState<string>("");
  const [userIntent, setUserIntent] = useState<string>("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState<string>("09:00");
  const [reminderOptIn, setReminderOptIn] = useState<boolean>(false);
  const [mission, setMission] = useState<string>("");

  useEffect(() => {
    localStorage.setItem('onboarding_step', currentStep);
  }, [currentStep]);

  const handleNext = () => {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("signup");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "signup":
        setCurrentStep("welcome");
        break;
      case "intent":
        setCurrentStep("signup");
        break;
      case "focus":
        setCurrentStep("intent");
        break;
      case "choose-habits":
        setCurrentStep("focus");
        break;
      case "frequency":
        if (currentHabitIndex > 0) {
          setCurrentHabitIndex(currentHabitIndex - 1);
        } else {
          setCurrentStep("choose-habits");
        }
        break;
      case "cadence":
        setCurrentStep("frequency");
        break;
      case "habit-suggestion":
        setCurrentStep("cadence");
        break;
      case "notification":
        setCurrentStep("habit-suggestion");
        break;
      case "mission":
        setCurrentStep("notification");
        break;
      case "mission-canvas":
        setCurrentStep("mission");
        break;
      case "canvas-growth":
        setCurrentStep("mission-canvas");
        break;
      default:
        break;
    }
  };

  const handleIntent = (intent: string) => {
    setUserIntent(intent);
    setCurrentStep("focus");
  };

  const handleFocus = (focus: string[]) => {
    setFocusAreas(focus);
    setCurrentStep("choose-habits");
  };

  const handleChooseHabits = (habits: string[]) => {
    setSelectedHabits(habits);
    setCurrentHabitIndex(0);
    setCurrentStep("frequency");
  };

  const handleFrequencySelection = (frequency: HabitFrequency) => {
    const currentHabit = selectedHabits[currentHabitIndex];
    setHabitFrequencies(prev => ({
      ...prev,
      [currentHabit]: frequency
    }));

    if (currentHabitIndex < selectedHabits.length - 1) {
      setCurrentHabitIndex(currentHabitIndex + 1);
    } else {
      setCurrentStep("cadence");
    }
  };

  const handleFrequencyBack = () => {
    if (currentHabitIndex > 0) {
      setCurrentHabitIndex(currentHabitIndex - 1);
    } else {
      setCurrentStep("choose-habits");
    }
  };

  const handleCadence = (selectedCadence: string) => {
    setCadence(selectedCadence);
    setCurrentStep("habit-suggestion");
  };

  const handleHabitSuggestion = () => {
    setCurrentStep("notification");
  };

  const handleNotification = (optIn: boolean, time: string) => {
    setReminderOptIn(optIn);
    setReminderTime(time);
    setCurrentStep("mission");
  };

  const handleMission = (missionText: string) => {
    setMission(missionText);
    setCurrentStep("mission-canvas");
  };

  const handleMissionCanvas = () => {
    setCurrentStep("canvas-growth");
  };

  const handleCanvasGrowth = async () => {
    await completeOnboarding();
  };

  const getHabitCategory = (habitName: string): string => {
    const categoryMap: Record<string, string> = {
      'Workout': 'Health & Fitness',
      'Devotions': 'Spiritual',
      'Read': 'Personal Development',
      'Sleep 8 Hours': 'Health & Fitness',
      'Drink Water': 'Health & Fitness',
      'Meditate': 'Mindfulness'
    };
    return categoryMap[habitName] || 'Personal';
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      console.log('Creating habits with frequencies:', habitFrequencies);
      console.log('Selected habits:', selectedHabits);
      
      for (const habitName of selectedHabits) {
        // Create the base habit first
        const habit = await addHabit({
          name: habitName,
          description: null,
          category: getHabitCategory(habitName),
          status: 'active',
          default_tracking_type: 'DAILY'
        });

        // Get the frequency configuration for this habit
        const frequency = habitFrequencies[habitName] || { type: 'DAILY' };

        // Create the user-specific habit configuration
        await createUserHabit({
          habit_id: habit.id,
          tracking_type: frequency.type,
          period: frequency.period,
          target_count: frequency.targetCount,
          selected_days: frequency.selectedDays,
          reminder_time: reminderTime,
          reminder_channel: reminderOptIn ? ['push'] : [],
        });
      }

      await supabase
        .from('profiles')
        .update({ 
          onboarding_complete: true,
          reminder_opt_in: reminderOptIn,
          reminder_time: reminderTime,
          user_intent: userIntent,
          focus_areas: focusAreas
        })
        .eq('id', user?.id);

      localStorage.setItem('onboarding_complete', 'true');
      localStorage.setItem('selectedHabits', JSON.stringify(selectedHabits));
      setCurrentStep("final");
      
      toast({
        title: "Welcome to DayWon!",
        description: "Your habits have been set up successfully.",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={handleNext} />;
      case "signup":
        return <SignUpScreen onNext={handleNext} onBack={handleBack} />;
      case "intent":
        return <IntentScreen onNext={handleIntent} onBack={handleBack} />;
      case "focus":
        return <PickFocusScreen onNext={handleFocus} onBack={handleBack} />;
      case "choose-habits":
        return <ChooseHabitsScreen onNext={handleChooseHabits} onBack={handleBack} focusAreas={focusAreas} />;
      case "frequency":
        return (
          <FrequencySelectionScreen 
            habitName={selectedHabits[currentHabitIndex]}
            onNext={handleFrequencySelection}
            onBack={handleFrequencyBack}
          />
        );
      case "cadence":
        return <CadenceSelectionScreen onNext={handleCadence} onBack={() => setCurrentStep("frequency")} />;
      case "habit-suggestion":
        return <HabitSuggestionScreen onNext={handleHabitSuggestion} onBack={handleBack} />;
      case "notification":
        return <NotificationScreen onNext={handleNotification} onBack={handleBack} />;
      case "mission":
        return <MissionScreen onNext={handleMission} onBack={handleBack} />;
      case "mission-canvas":
        return <MissionCanvasScreen onNext={handleMissionCanvas} onBack={handleBack} />;
      case "canvas-growth":
        return <CanvasGrowthScreen onNext={handleCanvasGrowth} onBack={handleBack} />;
      case "final":
        return <FinalScreen />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  }

  return null;
}