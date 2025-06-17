import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, ChevronRight, ArrowLeft, SkipForward } from "lucide-react";
import TrackCard, { HabitTrack } from "./TrackCard";
import { HABIT_TRACKS } from "@/data/habitTracks";

interface NotificationScreenProps {
  preferences: {
    enabled: boolean;
    customized: boolean;
  };
  onPreferencesChange: (prefs: { enabled: boolean; customized: boolean }) => void;
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
  const [selectedTrack, setSelectedTrack] = useState<HabitTrack | null>(null);

  const handleTrackSelect = (track: HabitTrack) => {
    setSelectedTrack(track);
  };

  const handleContinue = () => {
    // If a track is selected, add it to the onboarding data
    if (selectedTrack) {
      // This will be handled by the parent component
      console.log("Selected track:", selectedTrack);
    }
    onNext();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Notifications & Starter Track
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Stay on track with reminders and get started with a themed program
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notification Preferences
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {preferences.enabled ? (
                  <Bell className="w-5 h-5 text-green-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Enable Notifications
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

            {preferences.enabled && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Custom Timing
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set specific times for each habit reminder
                  </p>
                </div>
                <Switch
                  checked={preferences.customized}
                  onCheckedChange={(customized) => 
                    onPreferencesChange({ ...preferences, customized })
                  }
                />
              </div>
            )}
          </div>

          {/* Starter Track Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Pick a Starter Track (Optional)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose a pre-built program to help you get started with your habit journey
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {HABIT_TRACKS.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isSelected={selectedTrack?.id === track.id}
                  onSelect={handleTrackSelect}
                />
              ))}
            </div>

            {selectedTrack && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{selectedTrack.name}</strong> selected! This will add {selectedTrack.habits.length} habits to your dashboard and begin your {selectedTrack.duration}-day program.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex gap-3 flex-1">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="flex items-center gap-2 flex-1"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
              
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2 flex-1"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationScreen;
