
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Habit {
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'custom';
  customDays?: string[];
  customTime?: string;
}

interface ChooseHabitsScreenProps {
  focusAreas: string[];
  selectedHabits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const habitSuggestions: Record<string, string[]> = {
  move: ["Morning Walk", "Workout", "Stretch", "Take Stairs"],
  sleep: ["Consistent Bedtime", "No Screens Before Bed", "Read Before Sleep", "Morning Sunlight"],
  nutrition: ["Drink Water", "Eat Vegetables", "Meal Prep", "Mindful Eating"],
  mindfulness: ["Daily Prayer", "Meditation", "Gratitude Journal", "Deep Breathing"],
  learning: ["Read 20 Minutes", "Listen to Podcast", "Learn New Skill", "Journal"],
  custom: ["Custom Habit 1", "Custom Habit 2"]
};

const ChooseHabitsScreen = ({
  focusAreas,
  selectedHabits,
  onHabitsChange,
  onNext,
  onBack,
  onSkip
}: ChooseHabitsScreenProps) => {
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const availableHabits = focusAreas.flatMap(area => 
    habitSuggestions[area]?.map(habit => ({ name: habit, category: area })) || []
  );

  const toggleHabit = (habitName: string, category: string) => {
    const existingIndex = selectedHabits.findIndex(h => h.name === habitName);
    
    if (existingIndex >= 0) {
      onHabitsChange(selectedHabits.filter((_, index) => index !== existingIndex));
    } else {
      const newHabit: Habit = {
        name: habitName,
        category,
        frequency: 'daily',
        timeOfDay: 'morning'
      };
      onHabitsChange([...selectedHabits, newHabit]);
    }
  };

  const updateHabit = (habitName: string, updates: Partial<Habit>) => {
    onHabitsChange(selectedHabits.map(habit => 
      habit.name === habitName ? { ...habit, ...updates } : habit
    ));
  };

  const isHabitSelected = (habitName: string) => 
    selectedHabits.some(h => h.name === habitName);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Choose Your Habits
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select the habits you'd like to track and customize their settings.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3">
            {availableHabits.map((habit) => {
              const isSelected = isHabitSelected(habit.name);
              const selectedHabit = selectedHabits.find(h => h.name === habit.name);
              const isExpanded = expandedHabit === habit.name;
              
              return (
                <div key={habit.name} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isSelected}
                        onCheckedChange={() => toggleHabit(habit.name, habit.category)}
                      />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {habit.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {habit.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedHabit(isExpanded ? null : habit.name)}
                      >
                        {isExpanded ? "Less" : "Customize"}
                      </Button>
                    )}
                  </div>
                  
                  {isSelected && isExpanded && selectedHabit && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Frequency
                        </label>
                        <Select
                          value={selectedHabit.frequency}
                          onValueChange={(value: 'daily' | 'weekly' | 'custom') =>
                            updateHabit(habit.name, { frequency: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Time of Day
                        </label>
                        <Select
                          value={selectedHabit.timeOfDay}
                          onValueChange={(value: 'morning' | 'afternoon' | 'evening' | 'custom') =>
                            updateHabit(habit.name, { timeOfDay: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedHabits.length > 0 && (
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-200">
                {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
              <Button 
                onClick={onNext}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseHabitsScreen;
