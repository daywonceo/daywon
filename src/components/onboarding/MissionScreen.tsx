
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, Target, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const MissionScreen = ({ onNext, onBack, onSkip }: MissionScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const missionPoints = [
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Build Character",
      description: "Develop habits that align with your values and strengthen your character"
    },
    {
      icon: <Target className="w-6 h-6 text-secondary" />,
      title: "Achieve Goals",
      description: "Turn your aspirations into daily actions that compound over time"
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      title: "Grow Together",
      description: "Join a community of like-minded people on their growth journey"
    }
  ];

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Card className={cn(
        "glass-card transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Day Won
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
            Paint your life with purpose
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-foreground leading-relaxed mb-6">
              Day Won believes that small, consistent habits are the brushstrokes that create a masterpiece life. 
              Every day is an opportunity to add meaningful colors to your canvas.
            </p>
          </div>

          <div className="space-y-4">
            {missionPoints.map((point, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-start space-x-4 p-4 rounded-lg bg-subtle transition-all duration-300",
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                )}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm">
                    {point.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
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

export default MissionScreen;
