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
      colors: ["bg-primary-light", "bg-muted/30", "bg-muted/30"],
      habits: 1
    },
    {
      title: "Week 2", 
      description: "Adding new colors",
      colors: ["bg-primary", "bg-secondary-light", "bg-accent-light"],
      habits: 3
    },
    {
      title: "Month 3",
      description: "A beautiful masterpiece",
      colors: ["bg-primary", "bg-secondary", "bg-accent", "bg-muted", "bg-primary-light"],
      habits: 5
    }
  ];

  const currentStage = canvasStages[currentView];

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Card className={cn(
        "glass-card transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Palette className="w-16 h-16 text-accent animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Watch Your Canvas Grow
          </h1>
          <p className="text-muted-foreground mt-2">
            Every habit you build adds a new color to your life's masterpiece
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Canvas Visualization */}
          <div className="text-center">
            <div className="relative mx-auto w-48 h-32 border-4 border-border rounded-lg overflow-hidden bg-card shadow-inner">
              <div className="absolute inset-2 grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded transition-all duration-500",
                      i < currentStage.colors.length 
                        ? currentStage.colors[i % currentStage.colors.length]
                        : "bg-muted/20"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-1">
                {currentStage.title}
              </Badge>
              <p className="text-sm text-muted-foreground">
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
                    ? "bg-primary scale-125" 
                    : "bg-border"
                )}
              />
            ))}
          </div>

          {/* Growth Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary-light/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                Track Progress
              </p>
              <p className="text-xs text-muted-foreground">
                Visual streaks & analytics
              </p>
            </div>
            
            <div className="text-center p-3 bg-secondary-light/20 rounded-lg">
              <Calendar className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                Build Consistency
              </p>
              <p className="text-xs text-muted-foreground">
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
                className="gradient-primary text-primary-foreground"
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
