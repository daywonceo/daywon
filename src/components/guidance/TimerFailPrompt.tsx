
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface TimerFailPromptProps {
  manualMinutes: string;
  onManualMinutesChange: (value: string) => void;
  onManualTimeEntry: () => void;
  onTryAgain: () => void;
  onBack: () => void;
}

const TimerFailPrompt = ({
  manualMinutes,
  onManualMinutesChange,
  onManualTimeEntry,
  onTryAgain,
  onBack
}: TimerFailPromptProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400">
          Timer Issue Detected
        </h2>
      </div>

      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Timer Didn't Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700 dark:text-orange-300">
            Looks like your timer didn't start properly. Would you like to manually enter your workout time?
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                Workout duration (minutes)
              </label>
              <Input
                type="number"
                value={manualMinutes}
                onChange={(e) => onManualMinutesChange(e.target.value)}
                placeholder="e.g., 45"
                className="bg-white dark:bg-gray-800"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={onManualTimeEntry}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!manualMinutes}
              >
                Complete Workout
              </Button>
              <Button
                variant="outline"
                onClick={onTryAgain}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Try Timer Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerFailPrompt;
