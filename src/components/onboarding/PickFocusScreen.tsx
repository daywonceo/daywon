
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
  { id: "move", label: "Move More", icon: Dumbbell, color: "from-red-500 to-orange-500" },
  { id: "sleep", label: "Sleep Better", icon: Moon, color: "from-indigo-500 to-purple-500" },
  { id: "nutrition", label: "Eat Healthier", icon: Apple, color: "from-green-500 to-emerald-500" },
  { id: "mindfulness", label: "Mindfulness & Prayer", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "learning", label: "Reading & Learning", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { id: "custom", label: "Custom", icon: Plus, color: "from-gray-500 to-slate-500" },
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
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Pick Your Focus
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
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
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                  )}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r transition-all duration-200",
                      area.color,
                      isSelected ? "scale-110" : "group-hover:scale-105"
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      {area.label}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs">✓</Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedAreas.length > 0 && (
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-200">
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
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
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
