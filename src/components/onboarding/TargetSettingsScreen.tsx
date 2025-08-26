import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Minus, Plus, Clock, Calendar } from "lucide-react";
import { analytics } from "@/utils/analytics";

export interface TargetSettings {
  period: 'WEEK' | 'MONTH';
  targetCount: number;
  minRestDays?: number;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderTime?: string;
  reminderChannel: 'push' | 'email' | 'off';
}

interface TargetSettingsScreenProps {
  habitName: string;
  habitCategory?: string;
  onNext: (settings: TargetSettings) => void;
  onBack: () => void;
}

export default function TargetSettingsScreen({ 
  habitName, 
  habitCategory,
  onNext, 
  onBack 
}: TargetSettingsScreenProps) {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [targetCount, setTargetCount] = useState(3);
  const [minRestDays, setMinRestDays] = useState(0);
  const [timeWindowStart, setTimeWindowStart] = useState<string>('');
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('');
  const [reminderChannel, setReminderChannel] = useState<'push' | 'email' | 'off'>('off');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const weekPresets = [3, 4, 5];
  const monthPresets = [4, 8, 12];
  const currentPresets = period === 'WEEK' ? weekPresets : monthPresets;

  const handleTargetChange = (value: number) => {
    if (value >= 1) {
      setTargetCount(value);
    }
  };

  const handleNext = () => {
    const settings: TargetSettings = {
      period,
      targetCount,
      reminderChannel,
      ...(habitCategory === 'Physical' && minRestDays > 0 && { minRestDays }),
      ...(timeWindowStart && timeWindowEnd && { timeWindowStart, timeWindowEnd }),
      ...(reminderTime && reminderChannel !== 'off' && { reminderTime }),
    };

    // Track analytics
    analytics.trackTargetConfigured(
      period,
      targetCount,
      minRestDays > 0,
      !!(timeWindowStart && timeWindowEnd)
    );
    
    if (reminderChannel !== 'off') {
      analytics.trackReminderSet(reminderChannel, !!reminderTime);
    }

    onNext(settings);
  };

  const getPreviewText = () => {
    let preview = `${targetCount} per ${period.toLowerCase()}`;
    if (minRestDays > 0) preview += ` • ${minRestDays}d rest`;
    if (reminderTime && reminderChannel !== 'off') {
      const time = new Date(`2000-01-01T${reminderTime}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      preview += ` • ${time} reminders`;
    }
    return preview;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Aim for a count</h2>
        <p className="text-muted-foreground text-center">
          Hit it your way.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Time Period</Label>
            <RadioGroup 
              value={period} 
              onValueChange={(value) => {
                setPeriod(value as 'WEEK' | 'MONTH');
                // Reset to appropriate default when period changes
                setTargetCount(value === 'WEEK' ? 3 : 4);
              }}
              className="flex gap-4"
            >
              <Label htmlFor="week" className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="WEEK" id="week" />
                <span>Week</span>
              </Label>
              <Label htmlFor="month" className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="MONTH" id="month" />
                <span>Month</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Target Count */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Target Count</Label>
            
            {/* Presets */}
            <div className="flex gap-2 mb-3">
              {currentPresets.map((preset) => (
                <Button
                  key={preset}
                  variant={targetCount === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTargetCount(preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTargetChange(targetCount - 1)}
                disabled={targetCount <= 1}
                className="min-h-[48px] min-w-[48px]"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-3xl font-bold min-w-[4rem] text-center">
                {targetCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTargetChange(targetCount + 1)}
                className="min-h-[48px] min-w-[48px]"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                More options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Min Rest Days - Only for Physical */}
              {habitCategory === 'Physical' && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Minimum Rest Days</Label>
                  <p className="text-sm text-muted-foreground">
                    Days to rest between sessions (0-2)
                  </p>
                  <div className="flex items-center gap-4">
                    {[0, 1, 2].map((days) => (
                      <Button
                        key={days}
                        variant={minRestDays === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMinRestDays(days)}
                        className="min-h-[44px] min-w-[44px]"
                      >
                        {days}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Window */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Preferred Time Window
                </Label>
                <p className="text-sm text-muted-foreground">
                  When you typically prefer to do this habit
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-time" className="text-sm">Start</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={timeWindowStart}
                      onChange={(e) => setTimeWindowStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm">End</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={timeWindowEnd}
                      onChange={(e) => setTimeWindowEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Reminders */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Reminders</Label>
                <div className="space-y-3">
                  <Select value={reminderChannel} onValueChange={(value: 'push' | 'email' | 'off') => setReminderChannel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">No reminders</SelectItem>
                      <SelectItem value="push">Push notifications</SelectItem>
                      <SelectItem value="email">Email reminders</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {reminderChannel !== 'off' && (
                    <div>
                      <Label htmlFor="reminder-time" className="text-sm">Reminder Time</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        placeholder="09:00"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview */}
          <div className="pt-4 border-t">
            <Label className="text-sm text-muted-foreground">Preview:</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="text-sm">
                {getPreviewText()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6 pb-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1 min-h-[48px] text-muted-foreground"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={targetCount < 1}
          className="flex-1 min-h-[48px] text-lg font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}