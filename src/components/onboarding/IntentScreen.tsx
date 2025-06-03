
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentScreenProps {
  intent: string;
  onIntentChange: (intent: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const predefinedIntents = [
  { text: "Feel better about myself", icon: Heart, color: "from-pink-500 to-rose-500" },
  { text: "Reconnect with my faith", icon: Heart, color: "from-purple-500 to-indigo-500" },
  { text: "Build consistency in my life", icon: Target, color: "from-blue-500 to-cyan-500" },
  { text: "Improve my health", icon: Zap, color: "from-green-500 to-emerald-500" },
  { text: "Be a better role model", icon: Target, color: "from-orange-500 to-red-500" },
  { text: "Create positive change", icon: Zap, color: "from-yellow-500 to-orange-500" }
];

const IntentScreen = ({
  intent,
  onIntentChange,
  onNext,
  onBack,
  onSkip
}: IntentScreenProps) => {
  const [customIntent, setCustomIntent] = useState(
    predefinedIntents.some(p => p.text === intent) ? "" : intent
  );

  const selectPredefinedIntent = (selectedIntent: string) => {
    onIntentChange(selectedIntent);
    setCustomIntent("");
  };

  const handleCustomIntentChange = (value: string) => {
    setCustomIntent(value);
    onIntentChange(value);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Set Your Intent
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Why are you starting this journey? Your reason will help motivate you.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {predefinedIntents.map((predefined) => {
              const Icon = predefined.icon;
              const isSelected = intent === predefined.text;
              
              return (
                <button
                  key={predefined.text}
                  onClick={() => selectPredefinedIntent(predefined.text)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left group",
                    isSelected 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r transition-all duration-200",
                      predefined.color,
                      isSelected ? "scale-110" : "group-hover:scale-105"
                    )}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {predefined.text}
                    </span>
                    
                    {isSelected && (
                      <div className="ml-auto text-green-500">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Or write your own:
            </label>
            <Input
              placeholder="I want to start this journey because..."
              value={customIntent}
              onChange={(e) => handleCustomIntentChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          {intent && (
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-200">
                Intent set ✓
              </Badge>
            </div>
          )}
          
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

export default IntentScreen;
