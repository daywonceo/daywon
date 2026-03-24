import React, { useState } from "react";
import { type RaceType } from "@/data/raceData";
import { type TrainingParams, mdParse } from "@/utils/raceHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Dumbbell, Utensils, Brain, Zap, Heart, RefreshCw, Loader2, MessageCircle } from "lucide-react";

interface PlanViewerProps {
  raceType: RaceType;
  params: TrainingParams;
  plans: Record<string, string>;
  loading: Record<string, boolean>;
  onGenerateCategory: (category: string) => void;
  onBack: () => void;
  onOpenCoach: () => void;
}

const PLAN_TABS = [
  { id: "training", label: "Training", icon: Dumbbell, desc: "Week-by-week training schedule" },
  { id: "nutrition", label: "Nutrition", icon: Utensils, desc: "Daily fueling & meal guidance" },
  { id: "fueling", label: "Race Fuel", icon: Zap, desc: "In-race fueling strategy" },
  { id: "mental", label: "Mental", icon: Brain, desc: "Visualization, mantras & mental toughness" },
  { id: "recovery", label: "Recovery", icon: Heart, desc: "Post-race recovery roadmap" },
];

const PlanViewer: React.FC<PlanViewerProps> = ({
  raceType,
  params,
  plans,
  loading,
  onGenerateCategory,
  onBack,
  onOpenCoach,
}) => {
  const [activeTab, setActiveTab] = useState("training");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {raceType.icon} Your {raceType.name} Plan
          </h2>
          {params.specificRace && (
            <p className="text-xs text-muted-foreground">{params.specificRace.name}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onOpenCoach} className="gap-1.5">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Ask Coach</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          {PLAN_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 min-w-[60px] gap-1 text-xs sm:text-sm relative">
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {plans[tab.id] && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLAN_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {loading[tab.id] ? (
              <Card>
                <CardContent className="p-8 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Generating your {tab.label.toLowerCase()} plan...</p>
                  <p className="text-xs text-muted-foreground/60">This may take 10–20 seconds</p>
                </CardContent>
              </Card>
            ) : plans[tab.id] ? (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <tab.icon className="h-4 w-4 text-primary" />
                    {tab.label} Plan
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGenerateCategory(tab.id)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                  </Button>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-foreground [&_h1]:text-primary [&_h2]:text-foreground [&_h2]:border-border [&_strong]:text-foreground [&_li]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: mdParse(plans[tab.id]) }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <tab.icon className="h-7 w-7 text-primary/60" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{tab.label} Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">{tab.desc}</p>
                  </div>
                  <Button onClick={() => onGenerateCategory(tab.id)} className="gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Generate {tab.label} Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlanViewer;
