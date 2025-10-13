import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';

interface ChallengeBasicFormProps {
  formData: {
    title: string;
    description: string;
    target_value: number;
    target_unit: string;
  };
  unitOptions: string[];
  onChange: (field: string, value: any) => void;
}

const ChallengeBasicForm = ({ formData, unitOptions, onChange }: ChallengeBasicFormProps) => {
  return (
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
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Enter a catchy title for your challenge"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
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
              onChange={(e) => onChange('target_value', parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          <div>
            <Label htmlFor="target_unit">Unit</Label>
            <Select
              value={formData.target_unit}
              onValueChange={(value) => onChange('target_unit', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
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
  );
};

export default ChallengeBasicForm;
