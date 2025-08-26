import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, Clock, Bell } from "lucide-react";
import { analytics } from "@/utils/analytics";

export interface DailyReminderSettings {
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderTime?: string;
  reminderChannel: 'push' | 'email' | 'off';
}

interface DailyReminderScreenProps {
  habitName: string;
  onNext: (settings: DailyReminderSettings) => void;
  onBack: () => void;
}

export default function DailyReminderScreen({ 
  habitName, 
  onNext, 
  onBack 
}: DailyReminderScreenProps) {
  const [timeWindowStart, setTimeWindowStart] = useState<string>('');
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('');
  const [reminderChannel, setReminderChannel] = useState<'push' | 'email' | 'off'>('off');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleNext = () => {
    const settings: DailyReminderSettings = {
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

  const getPreviewText = () => {
    let preview = 'Daily';
    
    if (timeWindowStart && timeWindowEnd) {
      const startTime = new Date(`2000-01-01T${timeWindowStart}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const endTime = new Date(`2000-01-01T${timeWindowEnd}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      preview += ` • ${startTime}-${endTime}`;
    }
    
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
        <h2 className="text-2xl font-bold text-center mb-2">Show up daily</h2>
        <p className="text-muted-foreground text-center">
          We can remind you when it helps.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminder Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 min-h-[48px]"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="flex-1 min-h-[48px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}