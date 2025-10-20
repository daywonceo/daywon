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
    <div className="w-full max-w-md mx-auto p-4">
      <Card className={cn(
        "glass-card transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Welcome to Day Won
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
            Become who you're becoming
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to your journey of growth and transformation. Let's build habits that align with your values and help you flourish.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onNext}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-muted-foreground hover:text-foreground"
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
