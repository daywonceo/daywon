
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, TrendingUp, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasGrowthScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const CanvasGrowthScreen = ({ onNext, onBack, onSkip }: CanvasGrowthScreenProps) => {
  const [currentView, setCurrentView] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const canvasStages = [
    {
      title: "Day 1",
      description: "Your first brushstroke",
      colors: ["bg-blue-200", "bg-gray-100", "bg-gray-100"],
      habits: 1
    },
    {
      title: "Week 2", 
      description: "Adding new colors",
      colors: ["bg-blue-400", "bg-green-200", "bg-yellow-200"],
      habits: 3
    },
    {
      title: "Month 3",
      description: "A beautiful masterpiece",
      colors: ["bg-blue-500", "bg-green-400", "bg-yellow-400", "bg-purple-300", "bg-red-300"],
      habits: 5
    }
  ];

  const currentStage = canvasStages[currentView];

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className={cn(
        "border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Palette className="w-16 h-16 text-purple-600 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Watch Your Canvas Grow
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Every habit you build adds a new color to your life's masterpiece
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Canvas Visualization */}
          <div className="text-center">
            <div className="relative mx-auto w-48 h-32 border-4 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-inner">
              <div className="absolute inset-2 grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded transition-all duration-500",
                      i < currentStage.colors.length 
                        ? currentStage.colors[i % currentStage.colors.length]
                        : "bg-gray-100 dark:bg-gray-700"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-1">
                {currentStage.title}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStage.description}
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2">
            {canvasStages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentView === index 
                    ? "bg-blue-500 scale-125" 
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>

          {/* Growth Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Track Progress
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Visual streaks & analytics
              </p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Build Consistency
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Daily habit reminders
              </p>
            </div>
          </div>
          
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
                Start Building
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CanvasGrowthScreen;
