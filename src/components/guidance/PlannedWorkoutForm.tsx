
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, X } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";

interface PlannedWorkoutFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PlannedWorkoutForm = ({ onClose, onSuccess }: PlannedWorkoutFormProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  const [workoutDate, setWorkoutDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { workoutPlans } = useWorkoutPlans();
  const { createSession } = useWorkoutSessions();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
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
    
    if (!selectedDay !== null || !selectedWorkoutType || !workoutDate || !activePlan) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createSession({
        workout_plan_id: activePlan.id,
        workout_date: workoutDate,
        workout_type: selectedWorkoutType,
        notes: notes.trim() || undefined,
        planned_day_of_week: selectedDay!
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating planned workout:', error);
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
      // If it's today, schedule for next week
      targetDate.setDate(today.getDate() + 7);
    } else {
      targetDate.setDate(today.getDate() + daysUntilTarget);
    }
    
    return targetDate.toISOString().split('T')[0];
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setWorkoutDate(getNextDateForDay(day));
  };

  if (!activePlan) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please create and activate a workout plan first.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
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
            Schedule Workout
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="day-select">Day of Week</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDay === day.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDaySelect(day.value)}
                  className={selectedDay === day.value ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {day.label.substring(0, 3)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="workout-type">Workout Type</Label>
            <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workout-date">Date</Label>
            <Input
              id="workout-date"
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              required
            />
          </div>

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
              disabled={isSubmitting || selectedDay === null || !selectedWorkoutType || !workoutDate}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Scheduling...' : 'Schedule Workout'}
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
