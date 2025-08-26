import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { useUserHabits } from "@/hooks/useUserHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FrequencySelectionScreen, { type HabitFrequency } from "./FrequencySelectionScreen";

const SAMPLE_HABITS = [
  "Read for 30 minutes",
  "Workout", 
  "Meditate",
  "Drink 8 glasses of water",
  "Write in journal",
  "Take a walk"
];

export default function SimpleOnboardingFlow() {
  const { user } = useAuth();
  const { addHabit } = useHabits();
  const { createUserHabit } = useUserHabits();
  const [step, setStep] = useState<'select' | 'frequency' | 'complete'>('select');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [habitFrequencies, setHabitFrequencies] = useState<Record<string, HabitFrequency>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleHabitToggle = (habit: string) => {
    setSelectedHabits(prev => 
      prev.includes(habit) 
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  const handleFrequencyNext = (frequency: HabitFrequency) => {
    const currentHabit = selectedHabits[currentHabitIndex];
    setHabitFrequencies(prev => ({
      ...prev,
      [currentHabit]: frequency
    }));

    if (currentHabitIndex < selectedHabits.length - 1) {
      setCurrentHabitIndex(currentHabitIndex + 1);
    } else {
      completeSetup();
    }
  };

  const handleFrequencyBack = () => {
    if (currentHabitIndex > 0) {
      setCurrentHabitIndex(currentHabitIndex - 1);
    } else {
      setStep('select');
    }
  };

  const completeSetup = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      for (const habitName of selectedHabits) {
        const habit = await addHabit({
          name: habitName,
          description: null,
          category: 'Personal',
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
        habitName={selectedHabits[currentHabitIndex]}
        onNext={handleFrequencyNext}
        onBack={handleFrequencyBack}
      />
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
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Habits</CardTitle>
          <p className="text-muted-foreground">
            Select the habits you'd like to track. You'll configure frequencies next.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_HABITS.map((habit) => (
              <Button
                key={habit}
                variant={selectedHabits.includes(habit) ? "default" : "outline"}
                onClick={() => handleHabitToggle(habit)}
                className="justify-start h-auto p-4"
              >
                {habit}
              </Button>
            ))}
          </div>

          {selectedHabits.length > 0 && (
            <div className="pt-4 border-t">
              <Label>Selected habits:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedHabits.map((habit) => (
                  <Badge key={habit} variant="secondary">
                    {habit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => {
                if (selectedHabits.length > 0) {
                  setCurrentHabitIndex(0);
                  setStep('frequency');
                }
              }}
              disabled={selectedHabits.length === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? "Setting up..." : "Configure Frequencies"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}