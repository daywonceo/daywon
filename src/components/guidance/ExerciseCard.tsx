
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus } from "lucide-react";

interface ExerciseCardProps {
  exercise: any;
  onLog: (exercise: any, sets: number, reps: number, weight?: number) => void;
  isLogged: boolean;
}

const ExerciseCard = ({ exercise, onLog, isLogged }: ExerciseCardProps) => {
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);

  const handleLog = () => {
    onLog(exercise, sets, reps, weight);
    setShowForm(false);
  };

  return (
    <Card className={`${isLogged ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-white dark:bg-gray-800'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
              {exercise.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{exercise.muscle}</Badge>
              <Badge variant="outline">{exercise.difficulty}</Badge>
              {exercise.equipment && (
                <Badge variant="outline">{exercise.equipment}</Badge>
              )}
            </div>
          </div>
          {isLogged ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {exercise.instructions && (
        <CardContent className="pt-0 pb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {exercise.instructions}
          </p>
        </CardContent>
      )}

      {showForm && !isLogged && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500">Sets</label>
              <Input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Reps</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Weight (lbs)</label>
              <Input
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional"
              />
            </div>
          </div>
          <Button onClick={handleLog} size="sm" className="w-full">
            Log Exercise
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ExerciseCard;
