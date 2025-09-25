import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, BookOpen, Target, Brain } from 'lucide-react';
import { Clock, Users, Zap } from 'lucide-react';

interface QuickTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  participants: string;
  type: string;
  defaultValues: {
    challenge_type: string;
    target_value: number;
    target_unit: string;
    duration_days: number;
  };
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'weekly-workout',
    title: '7-Day Workout Challenge',
    description: 'Complete a workout every day for a week',
    icon: <Trophy size={16} className="text-blue-500" />,
    duration: '1 week',
    participants: 'Open',
    type: 'workout_count',
    defaultValues: {
      challenge_type: 'workout_count',
      target_value: 7,
      target_unit: 'workouts',
      duration_days: 7
    }
  },
  {
    id: 'reading-month',
    title: '30-Day Reading Challenge',
    description: 'Read for 30 minutes every day this month',
    icon: <BookOpen size={16} className="text-purple-500" />,
    duration: '1 month',
    participants: 'Open',
    type: 'reading',
    defaultValues: {
      challenge_type: 'reading',
      target_value: 30,
      target_unit: 'days',
      duration_days: 30
    }
  },
  {
    id: 'step-weekend',
    title: 'Weekend 10K Steps',
    description: 'Hit 10,000 steps both Saturday and Sunday',
    icon: <Target size={16} className="text-green-500" />,
    duration: '2 days',
    participants: 'Open',
    type: 'steps',
    defaultValues: {
      challenge_type: 'steps',
      target_value: 20000,
      target_unit: 'steps',
      duration_days: 2
    }
  },
  {
    id: 'meditation-week',
    title: 'Mindful Week',
    description: 'Meditate for 10 minutes daily for 7 days',
    icon: <Brain size={16} className="text-indigo-500" />,
    duration: '1 week',
    participants: 'Open',
    type: 'meditation',
    defaultValues: {
      challenge_type: 'meditation',
      target_value: 70,
      target_unit: 'minutes',
      duration_days: 7
    }
  }
];

interface QuickChallengeTemplatesProps {
  onSelectTemplate: (template: QuickTemplate) => void;
  className?: string;
}

const QuickChallengeTemplates = ({ onSelectTemplate, className }: QuickChallengeTemplatesProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Start Templates</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Get started with these popular challenge formats
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-white/90 dark:bg-gray-800/90"
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6">
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                    {template.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{template.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={10} />
                      <span>{template.participants}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-3 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
              >
                <Zap size={12} className="mr-1" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickChallengeTemplates;