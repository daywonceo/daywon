import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Sparkles, Target, Bell, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
// Remove unused import
import { supabase } from "@/integrations/supabase/client";
import { getHabitSuggestion, getDefaultHabitSuggestion } from "@/data/habitSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OnboardingData {
  focusAreas: string[];
  cadence: string;
}

interface FinalScreenProps {
  onComplete: () => void;
  onBack: () => void;
  data: OnboardingData;
}

const FinalScreen = ({ onComplete, onBack, data }: FinalScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowConfetti(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_complete: true
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        toast.error("Failed to complete onboarding");
        return;
      }

      toast.success("Welcome to Day Won! 🎉");
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const confettiColors = ['🎉', '🌟', '✨', '🎊', '💫'];

  // Get the suggested habit based on their selections
  const primaryFocusArea = data.focusAreas[0];
  const suggestion = primaryFocusArea && data.cadence
    ? getHabitSuggestion(data.cadence, primaryFocusArea)
    : getDefaultHabitSuggestion();

  const getCadenceDisplayName = (cadence: string) => {
    const names: { [key: string]: string } = {
      week: "1-week",
      month: "1-month", 
      season: "seasonal",
      ongoing: "ongoing"
    };
    return names[cadence] || cadence;
  };

  const getFocusAreaDisplayName = (focusArea: string) => {
    const names: { [key: string]: string } = {
      move: "physical",
      sleep: "physical",
      nutrition: "physical",
      mindfulness: "mental",
      learning: "mental",
      custom: "personal"
    };
    return names[focusArea] || focusArea;
  };

  const getAffirmation = (cadence: string) => {
    const affirmations: { [key: string]: string } = {
      week: "You've already won today by showing up.",
      month: "Let's build momentum — one day at a time.",
      season: "Slow growth is still growth. This is your Day One.",
      ongoing: "You've already won today. This is your Day One."
    };
    return affirmations[cadence] || "This is your Day One.";
  };

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
          {/* Personalized Confirmation Message */}
          {data.cadence && primaryFocusArea && suggestion && (
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                You've chosen a <span className="font-semibold text-green-600 dark:text-green-400">
                  {getCadenceDisplayName(data.cadence)}
                </span> focus on <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {getFocusAreaDisplayName(primaryFocusArea)}
                </span> habits.
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-gray-800 dark:text-gray-200 mb-2">
                  You'll start with:
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  "{suggestion.habit}"
                </p>
              </div>
              
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {getAffirmation(data.cadence)}
              </p>
            </div>
          )}
          
          {/* Note about flexibility */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can always change your cadence or focus area later if your needs shift.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="order-2 sm:order-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 order-1 sm:order-2"
            >
              {isLoading ? "Getting Started..." : "Start My Journey"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalScreen;