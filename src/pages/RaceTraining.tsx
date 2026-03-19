import React, { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RaceBrowser from "@/components/race-training/RaceBrowser";
import SetupWizard from "@/components/race-training/SetupWizard";
import PlanViewer from "@/components/race-training/PlanViewer";
import CoachChat from "@/components/race-training/CoachChat";
import { type RaceType, type RaceEvent } from "@/data/raceData";
import { type TrainingParams, mkProf, wksBetween } from "@/utils/raceHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type View = "browse" | "setup" | "plan";

const RaceTraining: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<View>("browse");
  const [raceType, setRaceType] = useState<RaceType | null>(null);
  const [raceEvent, setRaceEvent] = useState<RaceEvent | undefined>();
  const [params, setParams] = useState<TrainingParams | null>(null);
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showCoach, setShowCoach] = useState(false);

  const wks = useMemo(
    () => params?.startDate && params?.raceDate ? wksBetween(params.startDate, params.raceDate) : null,
    [params]
  );

  const handleSelectRace = (type: RaceType, event?: RaceEvent) => {
    setRaceType(type);
    setRaceEvent(event);
    setView("setup");
  };

  const generateCategory = useCallback(
    async (category: string) => {
      if (!raceType || !params) return;

      setLoading((prev) => ({ ...prev, [category]: true }));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const profile = mkProf(raceType, params, wks);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-race-training-plan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ profile, category }),
          }
        );

        if (!response.ok) throw new Error("Failed to generate plan");
        const data = await response.json();
        setPlans((prev) => ({ ...prev, [category]: data.plan }));
      } catch (err) {
        toast({
          title: "Generation Failed",
          description: "Couldn't generate the plan. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading((prev) => ({ ...prev, [category]: false }));
      }
    },
    [raceType, params, wks, toast]
  );

  const handleGenerate = async (p: TrainingParams) => {
    setParams(p);
    setView("plan");
    // Auto-generate training plan
    setLoading({ training: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const profile = mkProf(raceType!, p, p.startDate && p.raceDate ? wksBetween(p.startDate, p.raceDate) : null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-race-training-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ profile, category: "training" }),
        }
      );

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setPlans({ training: data.plan });
    } catch {
      toast({
        title: "Generation Failed",
        description: "Couldn't generate the plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading({ training: false });
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <Header />

      <div className="gradient-warm border-b border-primary-light/20">
        <div className="container-responsive pt-8 pb-6">
          <div className="text-center">
            <h1 className="text-gradient-primary text-3xl sm:text-4xl font-bold mb-2">
              🏁 Race Training
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              AI-powered endurance training plans for running, ultras & triathlons
            </p>
            <div className="flex justify-center mt-3">
              <div className="w-16 h-1 gradient-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <main className="container-responsive py-6">
        {view === "browse" && <RaceBrowser onSelectRace={handleSelectRace} />}
        {view === "setup" && raceType && (
          <SetupWizard
            raceType={raceType}
            raceEvent={raceEvent}
            onBack={() => setView("browse")}
            onGenerate={handleGenerate}
          />
        )}
        {view === "plan" && raceType && params && (
          <PlanViewer
            raceType={raceType}
            params={params}
            plans={plans}
            loading={loading}
            onGenerateCategory={generateCategory}
            onBack={() => setView("setup")}
            onOpenCoach={() => setShowCoach(true)}
          />
        )}
      </main>

      {showCoach && raceType && params && (
        <CoachChat
          raceType={raceType}
          params={params}
          wks={wks}
          plans={plans}
          onClose={() => setShowCoach(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default RaceTraining;
