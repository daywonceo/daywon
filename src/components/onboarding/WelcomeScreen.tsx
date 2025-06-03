import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeScreen = ({ onNext, onSkip }: WelcomeScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className={cn(
        "border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
            Become who you're becoming
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Welcome to your journey of growth and transformation. Let's build habits that align with your values and help you flourish.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onNext}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
