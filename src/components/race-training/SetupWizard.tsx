import React, { useState, useMemo } from "react";
import { type RaceType, type RaceEvent } from "@/data/raceData";
import {
  type TrainingParams,
  DEFAULT_PARAMS,
  getStartSuggestions,
  calcRisk,
  calcPredict,
  calcTaper,
  planStats,
  wksBetween,
  fmtDate,
} from "@/utils/raceHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Shield, TrendingUp, Clock, Zap } from "lucide-react";

interface SetupWizardProps {
  raceType: RaceType;
  raceEvent?: RaceEvent;
  onBack: () => void;
  onGenerate: (params: TrainingParams) => void;
}

const STEPS = ["Schedule", "Profile", "Preview"];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to structured training" },
  { id: "intermediate", label: "Intermediate", desc: "1-2 years experience" },
  { id: "advanced", label: "Advanced", desc: "3+ years, consistent" },
  { id: "elite", label: "Elite", desc: "Competitive racer" },
];

const EXPERIENCE_OPTIONS = ["First time", "1-2 races", "3-5 races", "Veteran (5+)"];

const SetupWizard: React.FC<SetupWizardProps> = ({ raceType, raceEvent, onBack, onGenerate }) => {
  const [step, setStep] = useState(0);
  const [params, setParams] = useState<TrainingParams>({
    ...DEFAULT_PARAMS,
    raceDate: raceEvent?.date ? new Date(raceEvent.date).toISOString().split("T")[0] : "",
    specificRace: raceEvent || null,
  });

  const wks = useMemo(
    () => (params.startDate && params.raceDate ? wksBetween(params.startDate, params.raceDate) : null),
    [params.startDate, params.raceDate]
  );

  const startSuggestions = useMemo(
    () => getStartSuggestions(raceType, params.raceDate),
    [raceType, params.raceDate]
  );

  const risk = useMemo(() => calcRisk(raceType, params, wks), [raceType, params, wks]);
  const prediction = useMemo(() => calcPredict(raceType, params), [raceType, params]);
  const taper = useMemo(() => calcTaper(raceType, wks), [raceType, wks]);
  const stats = useMemo(() => planStats(raceType, params, wks), [raceType, params, wks]);

  const update = (key: keyof TrainingParams, val: any) =>
    setParams((p) => ({ ...p, [key]: val }));

  const canAdvance =
    step === 0 ? params.startDate && params.raceDate :
    step === 1 ? params.fitnessLevel && params.experience :
    true;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={step === 0 ? onBack : () => setStep(step - 1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {step === 0 ? "Back" : "Previous"}
        </Button>
        <div className="flex-1 text-center">
          <span className="text-sm text-muted-foreground">
            {raceType.icon} {raceType.name} {raceEvent ? `— ${raceEvent.name}` : ""}
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted/30"}`} />
        ))}
      </div>

      {/* Step 0: Schedule */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold">Race Date</Label>
            <Input
              type="date"
              value={params.raceDate}
              onChange={(e) => update("raceDate", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Start Training</Label>
            <div className="grid gap-2 mt-2">
              {startSuggestions.map((s) => (
                <Card
                  key={s.date}
                  className={`cursor-pointer transition-all ${params.startDate === s.date ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`}
                  onClick={() => update("startDate", s.date)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                    {s.weeks && (
                      <Badge variant={s.recommended ? "default" : "outline"} className="text-xs">
                        {s.weeks} wks
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-2">
              <Input
                type="date"
                value={params.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                placeholder="Or pick a custom date"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Training Days / Week: {params.trainingDays}</Label>
            <Slider
              value={[params.trainingDays]}
              min={3}
              max={7}
              step={1}
              onValueChange={([v]) => update("trainingDays", v)}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3 days</span><span>7 days</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold">Fitness Level</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {FITNESS_LEVELS.map((f) => (
                <Card
                  key={f.id}
                  className={`cursor-pointer transition-all ${params.fitnessLevel === f.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`}
                  onClick={() => update("fitnessLevel", f.id)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-foreground text-sm">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Race Experience</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EXPERIENCE_OPTIONS.map((e) => (
                <Badge
                  key={e}
                  variant={params.experience === e ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => update("experience", e)}
                >
                  {e}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Goal Time (optional)</Label>
            <Input
              placeholder="e.g. 4:30:00 or 'just finish'"
              value={params.goalTime}
              onChange={(e) => update("goalTime", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Injuries / Limitations (optional)</Label>
            <Input
              placeholder="e.g. recovering knee, plantar fasciitis"
              value={params.injuries}
              onChange={(e) => update("injuries", e.target.value)}
              className="mt-1"
            />
          </div>

          {raceType.cat === "tri" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Strongest Discipline</Label>
                <Input
                  placeholder="Swim / Bike / Run"
                  value={params.triStrength}
                  onChange={(e) => update("triStrength", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Weakest Discipline</Label>
                <Input
                  placeholder="Swim / Bike / Run"
                  value={params.triWeakness}
                  onChange={(e) => update("triWeakness", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plan Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-muted/10">
                  <p className="text-lg font-bold text-primary">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`h-5 w-5 ${risk.level === "Low" ? "text-primary" : risk.level === "Moderate" ? "text-warning" : "text-destructive"}`} />
                <span className="font-semibold text-foreground text-sm">Injury Risk: {risk.level}</span>
                <div className="flex gap-0.5 ml-auto">
                  {[1, 2, 3].map((d) => (
                    <div key={d} className={`w-2 h-2 rounded-full ${d <= risk.dots ? (risk.level === "Low" ? "bg-primary" : risk.level === "Moderate" ? "bg-warning" : "bg-destructive") : "bg-muted/30"}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{risk.msg}</p>
            </CardContent>
          </Card>

          {/* Prediction */}
          {prediction && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Finish Time Predictor</span>
                  {prediction.adjusted && <Badge variant="outline" className="text-xs">Course-adjusted</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/10">
                    <p className="text-sm font-bold text-muted-foreground">{prediction.rough}</p>
                    <p className="text-xs text-muted-foreground">Conservative</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-bold text-primary">{prediction.likely}</p>
                    <p className="text-xs text-muted-foreground">Likely</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/10">
                    <p className="text-sm font-bold text-muted-foreground">{prediction.best}</p>
                    <p className="text-xs text-muted-foreground">Best Day</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Taper */}
          {taper.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="font-semibold text-foreground text-sm">Taper Schedule</span>
                </div>
                <div className="space-y-2">
                  {taper.map((w) => (
                    <div key={w.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">{w.label}</span>
                      <div className="flex-1 bg-muted/20 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${w.pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">{w.pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step < 2 ? (
          <Button
            className="flex-1"
            disabled={!canAdvance}
            onClick={() => setStep(step + 1)}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => onGenerate(params)}>
            <Zap className="h-4 w-4 mr-1" /> Generate AI Training Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
