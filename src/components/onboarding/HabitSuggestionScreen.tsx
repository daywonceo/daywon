import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Lightbulb, ArrowRight } from "lucide-react";
import { getHabitSuggestion, getDefaultHabitSuggestion } from "@/data/habitSuggestions";

interface HabitSuggestionScreenProps {
  selectedCadence: string;
  selectedFocusAreas: string[];
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const HabitSuggestionScreen = ({ 
  selectedCadence, 
  selectedFocusAreas,
  onNext, 
  onBack, 
  onSkip 
}: HabitSuggestionScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Get suggestion based on cadence and first focus area
  const primaryFocusArea = selectedFocusAreas[0];
  const suggestion = primaryFocusArea 
    ? getHabitSuggestion(selectedCadence, primaryFocusArea)
    : getDefaultHabitSuggestion();

  if (!suggestion) {
    return null;
  }

  const getCadenceDisplayName = (cadence: string) => {
    const names: { [key: string]: string } = {
      week: "1 Week",
      month: "1 Month", 
      season: "1 Season",
      ongoing: "Ongoing"
    };
    return names[cadence] || cadence;
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className={cn(
      "w-full max-w-2xl mx-auto transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Here's your starting point
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Based on your preferences, we suggest this habit to begin with
            </p>
          </div>

          {/* Suggestion Card */}
          <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {suggestion.habit}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 text-lg">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                      {getCadenceDisplayName(selectedCadence)}
                    </Badge>
                    <span>•</span>
                    <span className="italic">{suggestion.reasoning}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Encouragement Text */}
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              This is just a starting point. You can always add more habits or adjust as you go. 
              The goal is to take one meaningful step forward.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip
            </Button>

            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8"
            >
              Start Building
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitSuggestionScreen;