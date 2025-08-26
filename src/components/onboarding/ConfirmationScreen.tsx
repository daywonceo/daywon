import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { capitalizeHabitName } from "@/lib/utils";
import { type HabitFrequency } from "./FrequencySelectionScreen";

interface ConfirmationScreenProps {
  selectedHabits: string[];
  habitFrequencies: Record<string, HabitFrequency>;
  onEdit: (habitName: string) => void;
  onRemove: (habitName: string) => void;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export default function ConfirmationScreen({
  selectedHabits,
  habitFrequencies,
  onEdit,
  onRemove,
  onConfirm,
  onBack
}: ConfirmationScreenProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFrequencySummary = (habitName: string) => {
    const frequency = habitFrequencies[habitName];
    if (!frequency) return "Not configured";

    let summary = "";
    
    switch (frequency.type) {
      case 'DAILY':
        summary = "Every day";
        break;
      case 'N_PER_PERIOD':
        summary = `${frequency.targetCount} per ${frequency.period?.toLowerCase()}`;
        if (frequency.minRestDays && frequency.minRestDays > 0) {
          summary += ` (min ${frequency.minRestDays} rest day${frequency.minRestDays > 1 ? 's' : ''})`;
        }
        break;
      case 'SELECTED_DAYS':
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDayNames = frequency.selectedDays?.map(d => dayNames[d]).join(' • ') || '';
        summary = selectedDayNames;
        break;
    }

    // Add time window if specified
    if (frequency.timeWindowStart && frequency.timeWindowEnd) {
      const startTime = new Date(`2000-01-01T${frequency.timeWindowStart}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const endTime = new Date(`2000-01-01T${frequency.timeWindowEnd}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      summary += ` (${startTime}-${endTime})`;
    }

    // Add reminder info
    if (frequency.reminderTime && frequency.reminderChannel !== 'off') {
      const time = new Date(`2000-01-01T${frequency.reminderTime}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      summary += `, reminders ${time}`;
    } else {
      summary += ", no reminders";
    }

    return summary;
  };

  const handleConfirm = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error creating habits:', err);
      setError('Failed to create habits. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Ready to start</h2>
        <p className="text-muted-foreground text-center">
          Your plan is set. Track your progress from day one.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 mb-6">
        {selectedHabits.map((habitName) => (
          <Card key={habitName}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">
                    {capitalizeHabitName(habitName)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getFrequencySummary(habitName)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(habitName)}
                    className="p-2"
                    disabled={isCreating}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(habitName)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    disabled={isCreating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedHabits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Go back to choose some habits.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 min-h-[48px]"
            disabled={isCreating}
          >
            Back
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedHabits.length === 0 || isCreating}
            className="flex-1 min-h-[48px] text-lg font-medium"
          >
            {isCreating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating habits...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm & Create
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}