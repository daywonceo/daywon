import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Dumbbell, 
  Moon, 
  Apple, 
  Heart, 
  BookOpen, 
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PickFocusScreenProps {
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const focusAreas = [
  { id: "move", label: "Move More", icon: Dumbbell, color: "primary" },
  { id: "sleep", label: "Sleep Better", icon: Moon, color: "secondary" },
  { id: "nutrition", label: "Eat Healthier", icon: Apple, color: "accent" },
  { id: "mindfulness", label: "Mindfulness & Prayer", icon: Heart, color: "primary" },
  { id: "learning", label: "Reading & Learning", icon: BookOpen, color: "secondary" },
  { id: "custom", label: "Custom", icon: Plus, color: "muted" },
];

const PickFocusScreen = ({ 
  selectedAreas, 
  onSelectionChange, 
  onNext, 
  onBack, 
  onSkip 
}: PickFocusScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const toggleArea = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      onSelectionChange(selectedAreas.filter(id => id !== areaId));
    } else {
      onSelectionChange([...selectedAreas, areaId]);
    }
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
          focus_areas: selectedAreas
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving focus areas:', error);
        toast.error("Failed to save focus areas");
        return;
      }

      toast.success("Focus areas saved!");
      onNext();
    } catch (error) {
      console.error('Error saving focus areas:', error);
      toast.error("Failed to save focus areas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Pick Your Focus
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            What areas of your life would you like to improve? Choose one or more.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedAreas.includes(area.id);
              
              return (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group",
                    isSelected 
                      ? "border-primary bg-primary-light/20 shadow-md" 
                      : "border-border hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center gradient-primary transition-all duration-200",
                      isSelected ? "scale-110" : "group-hover:scale-105"
                    )}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      {area.label}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground text-xs">✓</Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedAreas.length > 0 && (
            <div className="text-center">
              <Badge variant="outline" className="text-primary border-primary/30">
                {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
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
                disabled={selectedAreas.length === 0 || isLoading}
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

export default PickFocusScreen;
