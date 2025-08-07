import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CadenceOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const CADENCE_OPTIONS: CadenceOption[] = [
  {
    id: "week",
    emoji: "🔁",
    title: "Just this week",
    description: "I want to try something small and doable."
  },
  {
    id: "month",
    emoji: "📆", 
    title: "1 month focus",
    description: "I'm ready to commit to a 30-day rhythm."
  },
  {
    id: "season",
    emoji: "🌿",
    title: "1 season reset (90 days)",
    description: "I want to build long-term structure into my life."
  },
  {
    id: "ongoing",
    emoji: "🔒",
    title: "Ongoing practice", 
    description: "I'm working on habits that I want to keep indefinitely."
  }
];

interface CadenceSelectionScreenProps {
  selectedCadence?: string;
  onCadenceChange: (cadence: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const CadenceSelectionScreen = ({ 
  selectedCadence, 
  onCadenceChange, 
  onNext, 
  onBack, 
  onSkip 
}: CadenceSelectionScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleContinue = () => {
    if (selectedCadence) {
      onNext();
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How would you like to approach building habits right now?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose the pace that feels right for you. You can always adjust later.
            </p>
          </div>

          {/* Cadence Options */}
          <div className="space-y-4 mb-8">
            {CADENCE_OPTIONS.map((option) => (
              <Card
                key={option.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedCadence === option.id
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                onClick={() => onCadenceChange(option.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{option.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              disabled={!selectedCadence}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadenceSelectionScreen;