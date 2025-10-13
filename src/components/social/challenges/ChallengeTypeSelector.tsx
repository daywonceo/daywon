import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CHALLENGE_TYPES = [
  {
    id: 'habit_streak',
    label: 'Habit Streak',
    description: 'Build a consistent habit over time',
    icon: '🔥',
    defaultUnit: 'days',
    unitOptions: ['days'],
  },
  {
    id: 'workout_count',
    label: 'Workout Challenge',
    description: 'Complete a target number of workouts',
    icon: '💪',
    defaultUnit: 'workouts',
    unitOptions: ['workouts', 'sessions'],
  },
  {
    id: 'steps',
    label: 'Steps Challenge',
    description: 'Reach a daily or total step goal',
    icon: '👟',
    defaultUnit: 'steps',
    unitOptions: ['steps', 'miles', 'kilometers'],
  },
  {
    id: 'reading',
    label: 'Reading Challenge',
    description: 'Read for a target amount of time or pages',
    icon: '📚',
    defaultUnit: 'minutes',
    unitOptions: ['minutes', 'hours', 'pages', 'books'],
  },
  {
    id: 'meditation',
    label: 'Meditation Challenge',
    description: 'Build a meditation practice',
    icon: '🧘‍♀️',
    defaultUnit: 'sessions',
    unitOptions: ['sessions', 'minutes', 'hours'],
  },
  {
    id: 'custom',
    label: 'Custom Challenge',
    description: 'Create your own unique challenge',
    icon: '🎯',
    defaultUnit: 'points',
    unitOptions: ['points', 'times', 'units'],
  },
];

interface ChallengeTypeSelectorProps {
  onSelect: (typeId: string) => void;
  onBack?: () => void;
}

const ChallengeTypeSelector = ({ onSelect, onBack }: ChallengeTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            ← Back to Templates
          </Button>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Choose the type of challenge you want to create
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CHALLENGE_TYPES.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-card"
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{type.icon}</div>
              <h3 className="font-medium mb-1 text-sm">
                {type.label}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {type.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChallengeTypeSelector;
