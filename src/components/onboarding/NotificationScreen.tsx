import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationScreenProps {
  preferences: {
    enabled: boolean;
    reminderTime: string;
  };
  onPreferencesChange: (prefs: { enabled: boolean; reminderTime: string }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const NotificationScreen = ({ 
  preferences, 
  onPreferencesChange, 
  onNext, 
  onBack, 
  onSkip 
}: NotificationScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          reminder_opt_in: preferences.enabled,
          reminder_time: preferences.reminderTime
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving notification preferences:', error);
        toast.error("Failed to save notification preferences");
        return;
      }

      toast.success("Notification preferences saved!");
      onNext();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Habit Reminders
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Stay on track with helpful notifications
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {preferences.enabled ? (
                <Bell className="w-5 h-5 text-green-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Enable Reminders
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get reminded to complete your daily habits
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(enabled) => 
                onPreferencesChange({ ...preferences, enabled })
              }
            />
          </div>

          {/* Reminder Time */}
          {preferences.enabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <Label htmlFor="reminderTime" className="text-sm font-medium">
                  Default Reminder Time
                </Label>
              </div>
              <Input
                id="reminderTime"
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => 
                  onPreferencesChange({ ...preferences, reminderTime: e.target.value })
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can customize individual habit times later
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                {isLoading ? "Saving..." : "Continue"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationScreen;