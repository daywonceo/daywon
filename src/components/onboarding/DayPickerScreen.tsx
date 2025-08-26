import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/utils/analytics";

export interface DayPickerSettings {
  selectedDays: number[];
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderTime?: string;
  reminderChannel: 'push' | 'email' | 'off';
}

interface DayPickerScreenProps {
  habitName: string;
  onNext: (settings: DayPickerSettings) => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0, fullName: 'Sunday' },
  { label: 'Mon', value: 1, fullName: 'Monday' },
  { label: 'Tue', value: 2, fullName: 'Tuesday' },
  { label: 'Wed', value: 3, fullName: 'Wednesday' },
  { label: 'Thu', value: 4, fullName: 'Thursday' },
  { label: 'Fri', value: 5, fullName: 'Friday' },
  { label: 'Sat', value: 6, fullName: 'Saturday' },
];

export default function DayPickerScreen({ 
  habitName, 
  onNext, 
  onBack 
}: DayPickerScreenProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeWindowStart, setTimeWindowStart] = useState<string>('');
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('');
  const [reminderChannel, setReminderChannel] = useState<'push' | 'email' | 'off'>('off');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const handleNext = () => {
    const settings: DayPickerSettings = {
      selectedDays,
      reminderChannel,
      ...(timeWindowStart && timeWindowEnd && { timeWindowStart, timeWindowEnd }),
      ...(reminderTime && reminderChannel !== 'off' && { reminderTime }),
    };

    // Track analytics
    if (reminderChannel !== 'off') {
      analytics.trackReminderSet(reminderChannel, !!reminderTime);
    }

    onNext(settings);
  };

  const getSummaryText = () => {
    if (selectedDays.length === 0) return "No days selected";
    
    const selectedDayLabels = selectedDays
      .map(dayValue => DAYS_OF_WEEK.find(d => d.value === dayValue)?.label)
      .filter(Boolean);
    
    return selectedDayLabels.join(' • ');
  };

  const getPreviewText = () => {
    let preview = getSummaryText();
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
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Choose your days</h2>
        <p className="text-muted-foreground text-center">
          Which days do you want to do <span className="font-medium">"{habitName}"</span>?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Day Picker Pills */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Days of the Week</Label>
            <div className="grid grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleDayToggle(day.value)}
                    className={cn(
                      "min-h-[48px] text-base font-medium transition-all",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </div>
            
            {/* Selected Days Summary */}
            {selectedDays.length > 0 && (
              <div className="pt-2">
                <Badge variant="secondary" className="text-sm">
                  {getSummaryText()}
                </Badge>
              </div>
            )}
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
          {selectedDays.length > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Preview:</Label>
              <div className="mt-1">
                <Badge variant="secondary" className="text-sm">
                  {getPreviewText()}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 min-h-[48px]"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={selectedDays.length === 0}
            className="flex-1 min-h-[48px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}