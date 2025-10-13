import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus } from 'lucide-react';
import { useChallengeManagement } from '@/hooks/useChallengeManagement';
import { format, addDays } from 'date-fns';
import QuickChallengeTemplates from './QuickChallengeTemplates';
import ChallengeTypeSelector, { CHALLENGE_TYPES } from './challenges/ChallengeTypeSelector';
import ChallengeBasicForm from './challenges/ChallengeBasicForm';
import ChallengeScheduleForm from './challenges/ChallengeScheduleForm';
import ChallengeParticipationForm from './challenges/ChallengeParticipationForm';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateChallengeModal = ({ open, onOpenChange, onSuccess }: CreateChallengeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(true);
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
      setShowTemplates(false);
      setFormData(prev => ({
        ...prev,
        challenge_type: typeId,
        target_unit: type.defaultUnit,
        title: `${type.label} Challenge`,
        description: type.description,
      }));
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedType(template.type);
    setShowTemplates(false);
    setFormData(prev => ({
      ...prev,
      challenge_type: template.defaultValues.challenge_type,
      target_value: template.defaultValues.target_value,
      target_unit: template.defaultValues.target_unit,
      title: template.title,
      description: template.description,
      end_date: format(addDays(new Date(), template.defaultValues.duration_days), 'yyyy-MM-dd'),
    }));
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
      setSelectedType('');
      setShowTemplates(true);
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
    if (selectedType) {
      setSelectedType('');
    } else {
      setShowTemplates(true);
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

        {/* Quick Templates */}
        {showTemplates && (
          <div className="space-y-6">
            <QuickChallengeTemplates onSelectTemplate={handleTemplateSelect} />
            
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400">
                    or create from scratch
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHALLENGE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-white/90 dark:bg-gray-800/90"
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                      {type.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Challenge Type Selection */}
        {!selectedType && !showTemplates && (
          <ChallengeTypeSelector
            onSelect={handleTypeSelect}
            onBack={handleBack}
          />
        )}

        {/* Challenge Details */}
        {selectedType && selectedChallengeType && (
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
            <ChallengeBasicForm
              formData={{
                title: formData.title,
                description: formData.description,
                target_value: formData.target_value,
                target_unit: formData.target_unit,
              }}
              unitOptions={selectedChallengeType.unitOptions}
              onChange={handleInputChange}
            />

            {/* Dates */}
            <ChallengeScheduleForm
              formData={{
                start_date: formData.start_date,
                end_date: formData.end_date,
              }}
              onChange={handleInputChange}
            />

            {/* Participation Settings */}
            <ChallengeParticipationForm
              formData={{
                max_participants: formData.max_participants,
                is_team_based: formData.is_team_based,
                max_team_size: formData.max_team_size,
              }}
              onChange={handleInputChange}
            />

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