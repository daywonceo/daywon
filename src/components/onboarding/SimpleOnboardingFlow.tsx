import React, { useState } from "react";
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

const CATEGORIES = ['Physical', 'Mental', 'Professional', 'Financial', 'Relational'] as const;

export default function SimpleOnboardingFlow() {
  const { user } = useAuth();
  const { addHabit } = useHabits();
  const { createUserHabit } = useUserHabits();
  const [step, setStep] = useState<'select' | 'frequency' | 'confirm' | 'complete'>('select');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [currentHabitForFrequency, setCurrentHabitForFrequency] = useState<string>('');
  const [habitFrequencies, setHabitFrequencies] = useState<Record<string, HabitFrequency>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      // Add habit and go to frequency selection
      setCurrentHabitForFrequency(habitName);
      setStep('frequency');
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

  const handleFrequencyBack = () => {
    setCurrentHabitForFrequency('');
    setStep('select');
  };

  const handleContinueToConfirm = () => {
    setStep('confirm');
  };

  const completeSetup = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      for (const habitName of selectedHabits) {
        const habitTemplate = HABIT_TEMPLATES.find(h => h.name === habitName);
        const habit = await addHabit({
          name: habitName,
          description: habitTemplate?.description || null,
          category: habitTemplate?.category || 'Personal',
          status: 'active',
          default_tracking_type: 'DAILY'
        });

        const frequency = habitFrequencies[habitName] || { type: 'DAILY' };
        
        await createUserHabit({
          habit_id: habit.id,
          tracking_type: frequency.type,
          period: frequency.period,
          target_count: frequency.targetCount,
          selected_days: frequency.selectedDays,
        });
      }

      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      setStep('complete');
      
      toast({
        title: "Setup complete!",
        description: "Your habits have been configured successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Confirm Your Habits</CardTitle>
            <p className="text-muted-foreground">
              Review your selected habits and their frequencies before we set them up.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedHabits.map((habitName) => {
                const frequency = habitFrequencies[habitName];
                const habitTemplate = HABIT_TEMPLATES.find(h => h.name === habitName);
                let frequencyText = 'Daily';
                
                if (frequency?.type === 'N_PER_PERIOD') {
                  frequencyText = `${frequency.targetCount} times per ${frequency.period?.toLowerCase()}`;
                } else if (frequency?.type === 'SELECTED_DAYS') {
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const selectedDayNames = frequency.selectedDays?.map(d => dayNames[d]).join(', ') || '';
                  frequencyText = `${selectedDayNames}`;
                }

                return (
                  <div key={habitName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{capitalizeHabitName(habitName)}</p>
                      <p className="text-sm text-muted-foreground">{frequencyText}</p>
                      <Badge variant="outline" className="mt-1">{habitTemplate?.category}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHabitToggle(habitName)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('select')}
                className="flex-1"
              >
                Back to Selection
              </Button>
              <Button 
                onClick={completeSetup}
                disabled={selectedHabits.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>🎉 You're all set!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your habits have been configured with flexible frequencies. Start tracking your progress!
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
          <CardTitle>Choose Your Habits</CardTitle>
          <p className="text-muted-foreground">
            Tap a habit to select it and configure its frequency. You can always modify these later.
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
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