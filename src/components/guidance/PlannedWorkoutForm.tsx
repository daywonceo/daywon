
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, X, Dumbbell } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import CustomWorkoutBuilder from "./CustomWorkoutBuilder";

interface PlannedWorkoutFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PlannedWorkoutForm = ({ onClose, onSuccess }: PlannedWorkoutFormProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  const [isCustomWorkout, setIsCustomWorkout] = useState<boolean>(false);
  const [customWorkoutName, setCustomWorkoutName] = useState<string>('');
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { workoutPlans } = useWorkoutPlans();
  const { createSession } = useWorkoutSessions();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  const getWorkoutTypesForPlan = (planType: string): string[] => {
    switch (planType) {
      case 'push_pull_legs':
        return ['push', 'pull', 'legs'];
      case 'upper_lower':
        return ['upper', 'lower'];
      case 'full_body':
        return ['full_body'];
      case 'chest_back_shoulders_arms_legs':
        return ['chest_back', 'shoulders_arms', 'legs'];
      default:
        return ['full_body'];
    }
  };

  const workoutTypes = activePlan ? getWorkoutTypesForPlan(activePlan.plan_type) : ['full_body'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDays.length === 0 || (!selectedWorkoutType && !isCustomWorkout) || (isCustomWorkout && !customWorkoutName.trim())) {
      return;
    }

    if (!activePlan && !isCustomWorkout) {
      return;
    }

    setIsSubmitting(true);

    try {
      const workoutTypeToUse = isCustomWorkout ? customWorkoutName.toLowerCase().replace(/\s+/g, '_') : selectedWorkoutType;
      const planId = isCustomWorkout ? null : activePlan?.id;

      // Create sessions for each selected day
      for (const dayOfWeek of selectedDays) {
        const targetDate = getNextDateForDay(dayOfWeek);
        
        await createSession({
          workout_plan_id: planId,
          workout_date: targetDate,
          workout_type: workoutTypeToUse,
          notes: notes.trim() || undefined,
          planned_day_of_week: dayOfWeek
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating planned workouts:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextDateForDay = (dayOfWeek: number): string => {
    const today = new Date();
    const todayDay = today.getDay();
    const daysUntilTarget = (dayOfWeek - todayDay + 7) % 7;
    const targetDate = new Date(today);
    
    if (daysUntilTarget === 0) {
      targetDate.setDate(today.getDate() + 7);
    } else {
      targetDate.setDate(today.getDate() + daysUntilTarget);
    }
    
    return targetDate.toISOString().split('T')[0];
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleWorkoutTypeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomWorkout(true);
      setSelectedWorkoutType('');
    } else {
      setIsCustomWorkout(false);
      setSelectedWorkoutType(value);
      setCustomWorkoutName('');
    }
  };

  if (!activePlan && !isCustomWorkout) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please create and activate a workout plan first, or create a custom workout.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => setIsCustomWorkout(true)} className="bg-green-600 hover:bg-green-700">
              <Dumbbell className="w-4 h-4 mr-2" />
              Create Custom Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Workout{selectedDays.length > 1 ? 's' : ''}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Days (multiple allowed)</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDayToggle(day.value)}
                  className={selectedDays.includes(day.value) ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {day.short}
                </Button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedDays.map(day => (
                  <Badge key={day} variant="secondary" className="text-xs">
                    {daysOfWeek.find(d => d.value === day)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="workout-type">Workout Type</Label>
            <Select value={isCustomWorkout ? 'custom' : selectedWorkoutType} onValueChange={handleWorkoutTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {activePlan && workoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    Build Custom Workout
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomWorkout && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <Label htmlFor="custom-workout-name">Custom Workout Name</Label>
                <Input
                  id="custom-workout-name"
                  value={customWorkoutName}
                  onChange={(e) => setCustomWorkoutName(e.target.value)}
                  placeholder="e.g., Upper Body Strength"
                  required={isCustomWorkout}
                />
              </div>
              
              <CustomWorkoutBuilder
                exercises={customExercises}
                onExercisesChange={setCustomExercises}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for this workout..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || selectedDays.length === 0 || (!selectedWorkoutType && !isCustomWorkout) || (isCustomWorkout && !customWorkoutName.trim())}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Scheduling...' : `Schedule for ${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''}`}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlannedWorkoutForm;
