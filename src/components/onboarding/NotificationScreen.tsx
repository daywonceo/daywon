
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  enabled: boolean;
  customized: boolean;
}

interface NotificationScreenProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (prefs: NotificationPreferences) => void;
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
  const options = [
    {
      id: 'enabled',
      title: 'Yes, send reminders',
      description: 'Get gentle nudges to help you stay on track',
      icon: Bell,
      color: 'from-green-500 to-emerald-500',
      action: () => onPreferencesChange({ enabled: true, customized: false })
    },
    {
      id: 'disabled',
      title: 'Not now',
      description: 'You can always enable notifications later',
      icon: BellOff,
      color: 'from-gray-400 to-gray-500',
      action: () => onPreferencesChange({ enabled: false, customized: false })
    },
    {
      id: 'custom',
      title: 'Customize reminders',
      description: 'Set specific times and preferences',
      icon: Settings,
      color: 'from-blue-500 to-cyan-500',
      action: () => onPreferencesChange({ enabled: true, customized: true })
    }
  ];

  const getSelectedOption = () => {
    if (!preferences.enabled) return 'disabled';
    if (preferences.customized) return 'custom';
    return 'enabled';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Stay on Track
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            How would you like us to support your journey?
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = getSelectedOption() === option.id;
            
            return (
              <button
                key={option.id}
                onClick={option.action}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                  isSelected 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md" 
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r transition-all duration-200",
                    option.color,
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className="text-green-500 text-xl">✓</div>
                  )}
                </div>
              </button>
            );
          })}
          
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
              <Button 
                onClick={onNext}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                Continue
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
