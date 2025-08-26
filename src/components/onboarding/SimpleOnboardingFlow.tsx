import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { useUserHabits } from "@/hooks/useUserHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { capitalizeHabitName } from "@/lib/utils";
import { HABIT_TEMPLATES, getHabitTemplatesByCategory } from "@/data/habitTemplates";
import FrequencySelectionScreen, { type HabitFrequency } from "./FrequencySelectionScreen";
import FrequencyStyleSelector, { type FrequencyStyle } from "./FrequencyStyleSelector";
import TargetSettingsScreen, { type TargetSettings } from "./TargetSettingsScreen";
import DayPickerScreen, { type DayPickerSettings } from "./DayPickerScreen";
import DailyReminderScreen, { type DailyReminderSettings } from "./DailyReminderScreen";
import ConfirmationScreen from "./ConfirmationScreen";
import { analytics } from "@/utils/analytics";
import { OnboardingValidator } from "@/utils/onboardingValidator";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";

const CATEGORIES = ['Physical', 'Mental', 'Professional', 'Financial', 'Relational'] as const;

export default function SimpleOnboardingFlow() {
  const { user } = useAuth();
  const { addHabit } = useHabits();
  const { createUserHabit } = useUserHabits();
  const { saveDraft, loadDraft, clearDraft } = useOnboardingPersistence();
  const [onboardingStartTime] = useState(Date.now());
  const [step, setStep] = useState<'select' | 'style' | 'targets' | 'days' | 'daily' | 'frequency' | 'confirm' | 'complete'>('select');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [currentHabitForFrequency, setCurrentHabitForFrequency] = useState<string>('');
  const [currentHabitStyle, setCurrentHabitStyle] = useState<FrequencyStyle | null>(null);
  const [currentTargetSettings, setCurrentTargetSettings] = useState<TargetSettings | null>(null);
  const [currentDaySettings, setCurrentDaySettings] = useState<DayPickerSettings | null>(null);
  const [currentDailySettings, setCurrentDailySettings] = useState<DailyReminderSettings | null>(null);
  const [habitFrequencies, setHabitFrequencies] = useState<Record<string, HabitFrequency>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setSelectedHabits(draft.selectedHabits || []);
      setHabitFrequencies(draft.habitFrequencies || {});
      setSelectedCategory(draft.selectedCategory || 'all');
    }
  }, []);

  // Save draft whenever state changes
  useEffect(() => {
    const draft = {
      selectedHabits,
      habitFrequencies,
      selectedCategory,
      step: step === 'complete' ? 'select' : step, // Don't restore complete state
    };
    saveDraft(draft);
  }, [selectedHabits, habitFrequencies, selectedCategory, step]);

  // Clear draft on completion
  useEffect(() => {
    if (step === 'complete') {
      clearDraft();
    }
  }, [step]);

  const filteredHabits = selectedCategory === 'all' 
    ? HABIT_TEMPLATES 
    : getHabitTemplatesByCategory(selectedCategory);

  const handleHabitToggle = (habitName: string) => {
    if (selectedHabits.includes(habitName)) {
      // Remove habit and its frequency configuration
      setSelectedHabits(prev => prev.filter(h => h !== habitName));
      setHabitFrequencies(prev => {
        const { [habitName]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      // Add habit and go to frequency style selection
      setCurrentHabitForFrequency(habitName);
      setStep('style');
    }
  };

  const handleFrequencyNext = (frequency: HabitFrequency) => {
    // Save frequency configuration and add habit to selected list
    setHabitFrequencies(prev => ({
      ...prev,
      [currentHabitForFrequency]: frequency
    }));
    setSelectedHabits(prev => [...prev, currentHabitForFrequency]);
    
    // Return to habit selection
    setCurrentHabitForFrequency('');
    setStep('select');
  };

  const handleStyleNext = (style: FrequencyStyle) => {
    setCurrentHabitStyle(style);
    if (style === 'N_PER_PERIOD') {
      setStep('targets');
    } else if (style === 'SELECTED_DAYS') {
      setStep('days');
    } else if (style === 'DAILY') {
      setStep('daily');
    } else {
      setStep('frequency');
    }
  };

  const handleTargetsNext = (settings: TargetSettings) => {
    setCurrentTargetSettings(settings);
    // Convert target settings to HabitFrequency format
    const frequency: HabitFrequency = {
      type: 'N_PER_PERIOD',
      period: settings.period,
      targetCount: settings.targetCount,
      minRestDays: settings.minRestDays,
      timeWindowStart: settings.timeWindowStart,
      timeWindowEnd: settings.timeWindowEnd,
      reminderTime: settings.reminderTime,
      reminderChannel: settings.reminderChannel,
    };
    handleFrequencyNext(frequency);
  };

  const handleTargetsBack = () => {
    setCurrentTargetSettings(null);
    setStep('style');
  };

  const handleDaysNext = (settings: DayPickerSettings) => {
    setCurrentDaySettings(settings);
    // Convert day settings to HabitFrequency format
    const frequency: HabitFrequency = {
      type: 'SELECTED_DAYS',
      selectedDays: settings.selectedDays,
      timeWindowStart: settings.timeWindowStart,
      timeWindowEnd: settings.timeWindowEnd,
      reminderTime: settings.reminderTime,
      reminderChannel: settings.reminderChannel,
    };
    handleFrequencyNext(frequency);
  };

  const handleDaysBack = () => {
    setCurrentDaySettings(null);
    setStep('style');
  };

  const handleDailyNext = (settings: DailyReminderSettings) => {
    setCurrentDailySettings(settings);
    // Convert daily settings to HabitFrequency format
    const frequency: HabitFrequency = {
      type: 'DAILY',
      timeWindowStart: settings.timeWindowStart,
      timeWindowEnd: settings.timeWindowEnd,
      reminderTime: settings.reminderTime,
      reminderChannel: settings.reminderChannel,
    };
    handleFrequencyNext(frequency);
  };

  const handleDailyBack = () => {
    setCurrentDailySettings(null);
    setStep('style');
  };

  const handleStyleBack = () => {
    setCurrentHabitForFrequency('');
    setCurrentHabitStyle(null);
    setStep('select');
  };

  const handleFrequencyBack = () => {
    setStep('style');
  };

  const handleContinueToConfirm = () => {
    setStep('confirm');
  };

  const handleEditHabit = (habitName: string) => {
    setCurrentHabitForFrequency(habitName);
    // Determine which step to go to based on frequency type
    const frequency = habitFrequencies[habitName];
    if (frequency?.type === 'N_PER_PERIOD') {
      setStep('targets');
    } else if (frequency?.type === 'SELECTED_DAYS') {
      setStep('days');
    } else if (frequency?.type === 'DAILY') {
      setStep('daily');
    } else {
      setStep('style');
    }
  };

  const handleRemoveHabit = (habitName: string) => {
    setSelectedHabits(prev => prev.filter(h => h !== habitName));
    setHabitFrequencies(prev => {
      const { [habitName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const completeSetup = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const errors: string[] = [];
    const createdHabits: string[] = [];
    const createdUserHabits: any[] = [];
    const habitCategories: string[] = [];
    const frequencyTypes: string[] = [];

    try {
      for (const habitName of selectedHabits) {
        try {
          const habitTemplate = HABIT_TEMPLATES.find(h => h.name === habitName);
          const frequency = habitFrequencies[habitName] || { type: 'DAILY' };

          // Track analytics - collect data for batch tracking
          if (habitTemplate?.category) {
            habitCategories.push(habitTemplate.category);
          }
          frequencyTypes.push(frequency.type);

          // Create the habit (or get existing one)
          const habit = await addHabit({
            name: habitName,
            description: habitTemplate?.description || null,
            category: habitTemplate?.category || 'Personal',
            status: 'active',
            default_tracking_type: frequency.type
          });

          // QA: Validate habit record
          OnboardingValidator.validateHabitRecord(habit, 'habit');

          // Build user habit config
          const userHabitConfig = {
            habit_id: habit.id,
            tracking_type: frequency.type,
            period: frequency.period,
            target_count: frequency.targetCount,
            selected_days: frequency.selectedDays,
            min_rest_days: frequency.minRestDays,
            time_window_start: frequency.timeWindowStart,
            time_window_end: frequency.timeWindowEnd,
            reminder_time: frequency.reminderTime,
            reminder_channel: frequency.reminderChannel ? [frequency.reminderChannel] : [],
          };

          // QA: Check for duplicates before creating
          const shouldCreate = await OnboardingValidator.assertNoDuplicateUserHabits(
            user.id, 
            habit.id, 
            userHabitConfig
          );

          if (shouldCreate) {
            const userHabit = await createUserHabit(userHabitConfig);
            
            // QA: Validate user habit record
            OnboardingValidator.validateHabitRecord(userHabit, 'user_habit');
            createdUserHabits.push(userHabit);
          }

          createdHabits.push(habitName);
        } catch (error) {
          console.error(`Error creating habit ${habitName}:`, error);
          errors.push(habitName);
        }
      }

      // Update profile to mark onboarding as complete
      if (createdHabits.length > 0) {
        await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', user.id);

        // Track analytics for successful completion
        const totalTimeSeconds = Math.round((Date.now() - onboardingStartTime) / 1000);
        
        analytics.trackHabitsCreated(
          createdHabits.length,
          [...new Set(habitCategories)], // Unique categories
          [...new Set(frequencyTypes)] // Unique frequency types
        );
        
        analytics.trackOnboardingComplete(createdHabits.length, totalTimeSeconds);

        // QA: Log summary
        OnboardingValidator.logOnboardingQASummary(createdHabits, createdUserHabits);
      }

      if (errors.length === 0) {
        setStep('complete');
        toast({
          title: "You're set!",
          description: `Your ${createdHabits.length} habit${createdHabits.length === 1 ? '' : 's'} ${createdHabits.length === 1 ? 'is' : 'are'} ready to track.`,
        });
      } else if (createdHabits.length > 0) {
        toast({
          title: "Partially complete",
          description: `${createdHabits.length} habits created. ${errors.length} failed - please try again.`,
          variant: "destructive",
        });
        throw new Error(`Failed to create: ${errors.join(', ')}`);
      } else {
        throw new Error('Failed to create any habits');
      }
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  };

  if (step === 'style') {
    const habitTemplate = HABIT_TEMPLATES.find(h => h.name === currentHabitForFrequency);
    return (
      <FrequencyStyleSelector
        habitName={currentHabitForFrequency}
        habitCategory={habitTemplate?.category}
        onNext={handleStyleNext}
        onBack={handleStyleBack}
      />
    );
  }

  if (step === 'targets') {
    const habitTemplate = HABIT_TEMPLATES.find(h => h.name === currentHabitForFrequency);
    return (
      <TargetSettingsScreen
        habitName={currentHabitForFrequency}
        habitCategory={habitTemplate?.category}
        onNext={handleTargetsNext}
        onBack={handleTargetsBack}
      />
    );
  }

  if (step === 'days') {
    return (
      <DayPickerScreen
        habitName={currentHabitForFrequency}
        onNext={handleDaysNext}
        onBack={handleDaysBack}
      />
    );
  }

  if (step === 'daily') {
    return (
      <DailyReminderScreen
        habitName={currentHabitForFrequency}
        onNext={handleDailyNext}
        onBack={handleDailyBack}
      />
    );
  }

  if (step === 'frequency') {
    return (
      <FrequencySelectionScreen
        habitName={currentHabitForFrequency}
        onNext={handleFrequencyNext}
        onBack={handleFrequencyBack}
      />
    );
  }

  if (step === 'confirm') {
    return (
      <ConfirmationScreen
        selectedHabits={selectedHabits}
        habitFrequencies={habitFrequencies}
        onEdit={handleEditHabit}
        onRemove={handleRemoveHabit}
        onConfirm={completeSetup}
        onBack={() => setStep('select')}
      />
    );
  }

  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>You're all set</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your habits are ready. Time to make progress.
            </p>
            <Button onClick={() => window.location.reload()}>
              Continue to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20"> {/* Added bottom padding for sticky button */}
      <Card>
        <CardHeader>
          <CardTitle>Choose your habits</CardTitle>
          <p className="text-muted-foreground">
            Tap a habit to set it up. Start with what matters most.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Habits
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          {/* Habits Grid - Mobile-first with large tap targets */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredHabits.map((habitTemplate) => (
              <div
                key={habitTemplate.id}
                onClick={() => handleHabitToggle(habitTemplate.name)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm min-h-[44px] ${
                  selectedHabits.includes(habitTemplate.name)
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2 flex items-center">
                  <p className="font-medium text-gray-800 dark:text-gray-200 leading-tight break-words">
                    {capitalizeHabitName(habitTemplate.name)}
                  </p>
                </div>
                <div className="flex items-center">
                  {selectedHabits.includes(habitTemplate.name) && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedHabits.length > 0 && (
            <div className="pt-4 border-t">
              <Label>Selected habits ({selectedHabits.length}):</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedHabits.map((habitName) => {
                  const frequency = habitFrequencies[habitName];
                  let frequencyText = 'Daily';
                  
                  if (frequency?.type === 'N_PER_PERIOD') {
                    frequencyText = `${frequency.targetCount}/${frequency.period?.toLowerCase()}`;
                  } else if (frequency?.type === 'SELECTED_DAYS') {
                    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    const selectedDayNames = frequency.selectedDays?.map(d => dayNames[d]).join('') || '';
                    frequencyText = selectedDayNames;
                  }

                  return (
                    <Badge key={habitName} variant="secondary" className="flex items-center gap-1">
                      <span>{capitalizeHabitName(habitName)}</span>
                      <span className="text-xs opacity-75">({frequencyText})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHabitToggle(habitName);
                        }}
                      >
                        ×
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Continue Button */}
      {selectedHabits.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-background/95 backdrop-blur border-t">
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={handleContinueToConfirm}
              className="w-full min-h-[48px] text-lg font-medium"
              size="lg"
            >
              Continue with {selectedHabits.length} habit{selectedHabits.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}