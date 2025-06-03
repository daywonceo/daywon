
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Sparkles, Target, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData } from "./OnboardingFlow";

interface FinalScreenProps {
  onComplete: () => void;
  onBack: () => void;
  data: OnboardingData;
}

const FinalScreen = ({ onComplete, onBack, data }: FinalScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowConfetti(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = ['🎉', '🌟', '✨', '🎊', '💫'];

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {confettiColors[Math.floor(Math.random() * confettiColors.length)]}
            </div>
          ))}
        </div>
      )}

      <Card className={cn(
        "border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-700 relative z-10",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            You're All Set!
          </CardTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
            Let's make today Day 1
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
            You've taken the first step towards building meaningful habits. Here's what you've set up:
          </p>
          
          {/* Summary */}
          <div className="space-y-4">
            {data.focusAreas.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Focus Areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.focusAreas.map(area => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {data.selectedHabits.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {data.selectedHabits.length} Habits Ready to Track
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {data.selectedHabits.map(h => h.name).join(', ')}
                </div>
              </div>
            )}
            
            {data.intent && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Your Why
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 italic">
                  "{data.intent}"
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Remember: Progress, not perfection. You've got this! 💪
            </p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={onComplete}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              Start My Journey
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalScreen;
