import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface ChallengeScheduleFormProps {
  formData: {
    start_date: string;
    end_date: string;
  };
  onChange: (field: string, value: string) => void;
}

const ChallengeScheduleForm = ({ formData, onChange }: ChallengeScheduleFormProps) => {
  return (
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
              onChange={(e) => onChange('start_date', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date *</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => onChange('end_date', e.target.value)}
              min={formData.start_date}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeScheduleForm;
