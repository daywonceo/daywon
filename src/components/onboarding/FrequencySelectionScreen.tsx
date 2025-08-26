import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FrequencyType = 'DAILY' | 'N_PER_PERIOD' | 'SELECTED_DAYS';
export type Period = 'WEEK' | 'MONTH';

export interface HabitFrequency {
  type: FrequencyType;
  period?: Period;
  targetCount?: number;
  selectedDays?: number[];
  minRestDays?: number;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderTime?: string;
  reminderChannel?: 'push' | 'email' | 'off';
}

interface FrequencySelectionScreenProps {
  habitName: string;
  onNext: (frequency: HabitFrequency) => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const FrequencySelectionScreen: React.FC<FrequencySelectionScreenProps> = ({
  habitName,
  onNext,
  onBack,
}) => {
  const [selectedType, setSelectedType] = useState<FrequencyType>('DAILY');
  const [period, setPeriod] = useState<Period>('WEEK');
  const [targetCount, setTargetCount] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const handleNext = () => {
    const frequency: HabitFrequency = {
      type: selectedType,
      ...(selectedType === 'N_PER_PERIOD' && { period, targetCount }),
      ...(selectedType === 'SELECTED_DAYS' && { selectedDays }),
    };
    onNext(frequency);
  };

  const isValid = () => {
    if (selectedType === 'N_PER_PERIOD') {
      return targetCount > 0;
    }
    if (selectedType === 'SELECTED_DAYS') {
      return selectedDays.length > 0;
    }
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          How often do you want to do "{habitName}"?
        </h1>
        <p className="text-muted-foreground">
          Choose the frequency that works best for your lifestyle
        </p>
      </div>

      <div className="space-y-4">
        {/* Daily Option */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedType === 'DAILY' && "ring-2 ring-primary bg-primary/5"
          )}
          onClick={() => setSelectedType('DAILY')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                selectedType === 'DAILY' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Every Day</h3>
                <p className="text-sm text-muted-foreground">
                  Build a consistent daily routine
                </p>
              </div>
              {selectedType === 'DAILY' && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* N Times Per Period Option */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedType === 'N_PER_PERIOD' && "ring-2 ring-primary bg-primary/5"
          )}
          onClick={() => setSelectedType('N_PER_PERIOD')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                selectedType === 'N_PER_PERIOD' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Target className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Target Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Set a target number of times per week or month
                </p>
              </div>
              {selectedType === 'N_PER_PERIOD' && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
            
            {selectedType === 'N_PER_PERIOD' && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="targetCount">Target Count</Label>
                    <Input
                      id="targetCount"
                      type="number"
                      min="1"
                      value={targetCount}
                      onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Period</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        variant={period === 'WEEK' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPeriod('WEEK')}
                        className="flex-1"
                      >
                        Week
                      </Button>
                      <Button
                        type="button"
                        variant={period === 'MONTH' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPeriod('MONTH')}
                        className="flex-1"
                      >
                        Month
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {targetCount} times per {period.toLowerCase()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specific Days Option */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedType === 'SELECTED_DAYS' && "ring-2 ring-primary bg-primary/5"
          )}
          onClick={() => setSelectedType('SELECTED_DAYS')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                selectedType === 'SELECTED_DAYS' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Specific Days</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which days of the week work for you
                </p>
              </div>
              {selectedType === 'SELECTED_DAYS' && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
            
            {selectedType === 'SELECTED_DAYS' && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <Label>Select Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDayToggle(day.value)}
                      className="flex-1 min-w-0"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                {selectedDays.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedDays.map((dayValue) => {
                      const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
                      return (
                        <Badge key={dayValue} variant="secondary">
                          {day?.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isValid()}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default FrequencySelectionScreen;