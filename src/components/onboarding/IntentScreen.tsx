import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface IntentScreenProps {
  intent: string;
  onIntentChange: (intent: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const predefinedIntents = [
  { text: "Feel better about myself", icon: Heart, color: "primary" },
  { text: "Reconnect with my faith", icon: Heart, color: "secondary" },
  { text: "Build consistency in my life", icon: Target, color: "accent" },
  { text: "Improve my health", icon: Zap, color: "primary" },
  { text: "Be a better role model", icon: Target, color: "secondary" },
  { text: "Create positive change", icon: Zap, color: "accent" }
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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const selectPredefinedIntent = (selectedIntent: string) => {
    onIntentChange(selectedIntent);
    setCustomIntent("");
  };

  const handleCustomIntentChange = (value: string) => {
    setCustomIntent(value);
    onIntentChange(value);
  };

  const handleContinue = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_intent: intent
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving intent:', error);
        toast.error("Failed to save intent");
        return;
      }

      toast.success("Intent saved!");
      onNext();
    } catch (error) {
      console.error('Error saving intent:', error);
      toast.error("Failed to save intent");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Set Your Intent
          </CardTitle>
          <p className="text-muted-foreground mt-2">
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
                      ? "border-primary bg-primary-light/20 shadow-md" 
                      : "border-border hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center gradient-primary transition-all duration-200",
                      isSelected ? "scale-110" : "group-hover:scale-105"
                    )}>
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    
                    <span className="text-sm font-medium text-foreground">
                      {predefined.text}
                    </span>
                    
                    {isSelected && (
                      <div className="ml-auto text-primary">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
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
              <Badge variant="outline" className="text-primary border-primary/30">
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
                onClick={handleContinue}
                disabled={isLoading}
                className="gradient-primary text-primary-foreground"
              >
                {isLoading ? "Saving..." : "Continue"}
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
