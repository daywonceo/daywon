
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Dumbbell } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useExercises } from "@/hooks/useExercises";

interface WorkoutPlanSelectorProps {
  onBack: () => void;
}

const WorkoutPlanSelector = ({ onBack }: WorkoutPlanSelectorProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('beginner');
  const [planName, setPlanName] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<any>(null);
  
  const { createWorkoutPlan } = useWorkoutPlans();
  const { generateWorkoutPlan, isLoading } = useExercises();

  const planTypes = [
    {
      id: 'push_pull_legs',
      name: 'Push/Pull/Legs',
      description: '3-day split focusing on movement patterns',
      days: ['Push (Chest, Shoulders, Triceps)', 'Pull (Back, Biceps)', 'Legs (Quads, Hamstrings, Calves)'],
      duration: '45-60 min per workout'
    },
    {
      id: 'upper_lower',
      name: 'Upper/Lower',
      description: '2-day split alternating upper and lower body',
      days: ['Upper Body', 'Lower Body'],
      duration: '50-70 min per workout'
    },
    {
      id: 'full_body',
      name: 'Full Body',
      description: 'Complete body workout in each session',
      days: ['Full Body Workout'],
      duration: '60-75 min per workout'
    },
    {
      id: 'chest_back_shoulders_arms_legs',
      name: 'Body Part Split',
      description: '3-day split targeting specific muscle groups',
      days: ['Chest & Back', 'Shoulders & Arms', 'Legs'],
      duration: '40-55 min per workout'
    }
  ];

  const difficulties = ['beginner', 'intermediate', 'expert'];

  const handlePreview = async () => {
    if (!selectedPlan) return;
    
    const plan = await generateWorkoutPlan(selectedPlan, selectedDifficulty);
    if (plan) {
      setPreviewPlan(plan);
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedPlan || !planName.trim()) return;
    
    setIsCreating(true);
    try {
      const plan = await createWorkoutPlan(selectedPlan, planName.trim());
      if (plan) {
        onBack();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          Create Workout Plan
        </h2>
      </div>

      {/* Plan Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Choose Your Split</h3>
        <div className="grid gap-4">
          {planTypes.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {plan.description}
                    </p>
                  </div>
                  {selectedPlan === plan.id && (
                    <Target className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {plan.days.map((day, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.duration}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      {selectedPlan && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Select Difficulty</h3>
          <div className="flex gap-2">
            {difficulties.map((level) => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(level)}
                className={selectedDifficulty === level ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Plan Name */}
      {selectedPlan && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Name Your Plan</h3>
          <Input
            placeholder="e.g., My Summer Workout Plan"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Preview Plan */}
      {selectedPlan && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading}
              className="flex-1"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Preview Exercises
            </Button>
          </div>
        </div>
      )}

      {/* Preview Results */}
      {previewPlan && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-400">
              Plan Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(previewPlan).map(([workoutName, workoutData]: [string, any]) => (
              <div key={workoutName} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold capitalize text-gray-800 dark:text-gray-200">
                    {workoutName.replace(/_/g, ' ')}
                  </h4>
                  <Badge variant="outline">
                    ~{workoutData.estimatedDuration} min
                  </Badge>
                </div>
                <div className="space-y-2">
                  {workoutData.exercises.slice(0, 3).map((exercise: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {exercise.name} ({exercise.muscle})
                    </div>
                  ))}
                  {workoutData.exercises.length > 3 && (
                    <div className="text-sm text-gray-500 italic">
                      +{workoutData.exercises.length - 3} more exercises...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {selectedPlan && planName.trim() && (
        <Button
          onClick={handleCreatePlan}
          disabled={isCreating}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isCreating ? 'Creating Plan...' : 'Create Workout Plan'}
        </Button>
      )}
    </div>
  );
};

export default WorkoutPlanSelector;
