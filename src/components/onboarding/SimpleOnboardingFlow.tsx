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
  const [step, setStep] = useState<'select' | 'frequency' | 'complete'>('select');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [habitFrequencies, setHabitFrequencies] = useState<Record<string, HabitFrequency>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredHabits = selectedCategory === 'all' 
    ? HABIT_TEMPLATES 
    : getHabitTemplatesByCategory(selectedCategory);

  const handleHabitToggle = (habitName: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitName) 
        ? prev.filter(h => h !== habitName)
        : [...prev, habitName]
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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Habits</CardTitle>
          <p className="text-muted-foreground">
            Select the habits you'd like to track. You'll configure frequencies next.
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
          {/* Habits Grid - Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredHabits.map((habitTemplate) => (
              <div
                key={habitTemplate.id}
                onClick={() => handleHabitToggle(habitTemplate.name)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedHabits.includes(habitTemplate.name)
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                }`}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {capitalizeHabitName(habitTemplate.name)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedHabits.includes(habitTemplate.name) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedHabits.length > 0 && (
            <div className="pt-4 border-t">
              <Label>Selected habits:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedHabits.map((habitName) => {
                  const habitTemplate = HABIT_TEMPLATES.find(h => h.name === habitName);
                  return (
                    <Badge key={habitName} variant="secondary" className="flex items-center gap-1">
                      {capitalizeHabitName(habitName)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
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

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => {
                if (selectedHabits.length > 0) {
                  setCurrentHabitIndex(0);
                  setStep('frequency');
                }
              }}
              disabled={selectedHabits.length === 0 || isLoading}
              className="flex-1 min-h-[48px]"
            >
              {isLoading ? "Setting up..." : "Configure Frequencies"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}