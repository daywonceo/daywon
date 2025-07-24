import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Users, Trophy, Clock, Plus } from 'lucide-react';
import { useChallengeManagement } from '@/hooks/useChallengeManagement';
import { format, addDays } from 'date-fns';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CHALLENGE_TYPES = [
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

const CreateChallengeModal = ({ open, onOpenChange, onSuccess }: CreateChallengeModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: '',
    target_value: 30,
    target_unit: 'days',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    max_participants: '',
    is_team_based: false,
    max_team_size: 4,
    rules: '',
  });

  const { createChallenge, submitting } = useChallengeManagement();

  const selectedChallengeType = CHALLENGE_TYPES.find(type => type.id === selectedType);

  const handleTypeSelect = (typeId: string) => {
    const type = CHALLENGE_TYPES.find(t => t.id === typeId);
    if (type) {
      setSelectedType(typeId);
      setFormData(prev => ({
        ...prev,
        challenge_type: typeId,
        target_unit: type.defaultUnit,
      }));
      setStep(2);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const challengeData = {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
    };

    const result = await createChallenge(challengeData);
    
    if (result.success) {
      // Reset form
      setStep(1);
      setSelectedType('');
      setFormData({
        title: '',
        description: '',
        challenge_type: '',
        target_value: 30,
        target_unit: 'days',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        max_participants: '',
        is_team_based: false,
        max_team_size: 4,
        rules: '',
      });
      
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="text-purple-600" size={18} />
            <span>Create Challenge</span>
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Challenge Type Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose the type of challenge you want to create
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHALLENGE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-white/90 dark:bg-gray-800/90"
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {type.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Challenge Details */}
        {step === 2 && selectedChallengeType && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
              <Badge variant="outline" className="flex items-center space-x-1">
                <span className="text-lg">{selectedChallengeType.icon}</span>
                <span>{selectedChallengeType.label}</span>
              </Badge>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target size={18} />
                  <span>Challenge Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Challenge Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a catchy title for your challenge"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your challenge and motivate participants"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_value">Target Goal *</Label>
                    <Input
                      id="target_value"
                      type="number"
                      value={formData.target_value}
                      onChange={(e) => handleInputChange('target_value', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_unit">Unit</Label>
                    <Select
                      value={formData.target_unit}
                      onValueChange={(value) => handleInputChange('target_unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedChallengeType.unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      min={formData.start_date}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users size={18} />
                  <span>Participation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_participants">Max Participants (optional)</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange('max_participants', e.target.value)}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited participants
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Team-based Challenge</Label>
                    <p className="text-xs text-gray-500">
                      Allow participants to form teams
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_team_based}
                    onCheckedChange={(checked) => handleInputChange('is_team_based', checked)}
                  />
                </div>

                {formData.is_team_based && (
                  <div>
                    <Label htmlFor="max_team_size">Max Team Size</Label>
                    <Input
                      id="max_team_size"
                      type="number"
                      value={formData.max_team_size}
                      onChange={(e) => handleInputChange('max_team_size', parseInt(e.target.value))}
                      min="2"
                      max="20"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rules (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Rules (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  placeholder="Add any specific rules or guidelines for participants"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-1" />
                    Create Challenge
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;