import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarDays, Target, Calendar } from "lucide-react";
import { analytics } from "@/utils/analytics";

export type FrequencyStyle = 'DAILY' | 'N_PER_PERIOD' | 'SELECTED_DAYS';

interface FrequencyStyleSelectorProps {
  habitName: string;
  habitCategory?: string;
  onNext: (style: FrequencyStyle) => void;
  onBack: () => void;
}

export default function FrequencyStyleSelector({ 
  habitName, 
  habitCategory,
  onNext, 
  onBack 
}: FrequencyStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<FrequencyStyle | null>(null);

  // Set default for Physical habits
  useEffect(() => {
    if (habitCategory === 'Physical') {
      setSelectedStyle('N_PER_PERIOD');
    }
  }, [habitCategory]);

  const handleNext = () => {
    if (selectedStyle) {
      // Track analytics
      analytics.trackFrequencyStyleSelected(selectedStyle, habitCategory);
      onNext(selectedStyle);
    }
  };

  const frequencyOptions = [
    {
      value: 'DAILY' as FrequencyStyle,
      icon: CalendarDays,
      title: 'Every day',
      description: 'Show up daily.',
    },
    {
      value: 'N_PER_PERIOD' as FrequencyStyle,
      icon: Target,
      title: 'X times per period',
      description: 'Aim for a count. Hit it your way.',
    },
    {
      value: 'SELECTED_DAYS' as FrequencyStyle,
      icon: Calendar,
      title: 'Specific days',
      description: 'Lock in the rhythm that works.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Pick the pace that fits your life</h2>
        <p className="text-muted-foreground text-center">
          You can change this anytime.
        </p>
      </div>

      <RadioGroup 
        value={selectedStyle || ''} 
        onValueChange={(value) => setSelectedStyle(value as FrequencyStyle)}
        className="space-y-4"
      >
        {frequencyOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedStyle === option.value;
          
          return (
            <Label key={option.value} htmlFor={option.value} className="cursor-pointer">
              <Card className={`min-h-[60px] transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:bg-muted/50 border-border'
              }`}>
                <CardContent className="flex items-center p-4 space-x-4 min-h-[60px]">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="flex gap-4 mt-8 pb-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1 min-h-[48px] text-muted-foreground"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedStyle}
          className="flex-1 min-h-[48px] text-lg font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}