import React, { useState } from "react";
import { type RaceType } from "@/data/raceData";
import { type TrainingParams, mdParse, extractSection } from "@/utils/raceHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Dumbbell, Utensils, Brain, RefreshCw, Loader2 } from "lucide-react";

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
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "mental", label: "Mental", icon: Brain },
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
        <Button variant="outline" size="sm" onClick={onOpenCoach}>
          💬 Coach
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          {PLAN_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 gap-1">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
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
                </CardContent>
              </Card>
            ) : plans[tab.id] ? (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{tab.label} Plan</CardTitle>
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
              <Card>
                <CardContent className="p-8 text-center space-y-3">
                  <tab.icon className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No {tab.label.toLowerCase()} plan generated yet.
                  </p>
                  <Button onClick={() => onGenerateCategory(tab.id)}>
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
