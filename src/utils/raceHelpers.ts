import type { RaceType, RaceEvent } from "@/data/raceData";

// ─────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────
export const wksBetween = (a: string, b: string): number =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (7 * 864e5));

export const fmtDate = (d: string): string =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

export const fmtElev = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K ft` : `${n} ft`;

// ─────────────────────────────────────────────
// TRAINING PARAMS
// ─────────────────────────────────────────────
export interface TrainingParams {
  trainingDays: number;
  experience: string;
  injuries: string;
  goalTime: string;
  raceDate: string;
  fitnessLevel: string;
  startDate: string;
  triStrength: string;
  triWeakness: string;
  specificRace: RaceEvent | null;
}

export const DEFAULT_PARAMS: TrainingParams = {
  trainingDays: 4,
  experience: "",
  injuries: "",
  goalTime: "",
  raceDate: "",
  fitnessLevel: "intermediate",
  startDate: "",
  triStrength: "",
  triWeakness: "",
  specificRace: null,
};

// ─────────────────────────────────────────────
// START DATE SUGGESTIONS
// ─────────────────────────────────────────────
export interface StartSuggestion {
  label: string;
  date: string;
  weeks?: number;
  note: string;
  recommended?: boolean;
}

export function getStartSuggestions(race: RaceType, raceDate: string): StartSuggestion[] {
  const TODAY = new Date();
  const tom = new Date(TODAY);
  tom.setDate(tom.getDate() + 1);
  const tomS = tom.toISOString().split("T")[0];

  if (!raceDate) {
    return [
      { label: "Tomorrow", date: tomS, note: "Start with momentum" },
      { label: "Next Week", date: new Date(TODAY.getTime() + 7 * 864e5).toISOString().split("T")[0], note: "A few days to prepare" },
      { label: "In 2 Weeks", date: new Date(TODAY.getTime() + 14 * 864e5).toISOString().split("T")[0], note: "Gear up first" },
    ];
  }

  const s: StartSuggestion[] = [];
  const tomW = wksBetween(tomS, raceDate);

  if (tomW >= 2) {
    s.push({
      label: "Tomorrow",
      date: tomS,
      weeks: tomW,
      note: tomW >= race.maxW ? "Max build time" : tomW >= race.minW ? "Solid window" : `${tomW} wks — tight`,
    });
  }

  const iW = Math.min(race.maxW, Math.max(race.minW, Math.round((race.minW + race.maxW) / 2)));
  const iD = new Date(raceDate);
  iD.setDate(iD.getDate() - iW * 7);
  const iS = iD.toISOString().split("T")[0];
  if (iS > tomS) {
    s.push({ label: fmtDate(iS), date: iS, weeks: iW, note: `Coach's pick — ${iW} weeks`, recommended: true });
  }

  const lD = new Date(raceDate);
  lD.setDate(lD.getDate() - race.minW * 7);
  const lS = lD.toISOString().split("T")[0];
  if (lS > (s.at(-1)?.date || tomS) && lS !== iS) {
    s.push({ label: fmtDate(lS), date: lS, weeks: race.minW, note: `Minimum — ${race.minW} weeks` });
  }

  if (!s.length) {
    s.push({ label: "Tomorrow", date: tomS, weeks: tomW, note: "Start immediately" });
  }

  return s.slice(0, 3);
}

// ─────────────────────────────────────────────
// INJURY RISK CALCULATOR
// ─────────────────────────────────────────────
export interface RiskResult {
  level: "Low" | "Moderate" | "Elevated";
  dots: number;
  msg: string;
}

export function calcRisk(race: RaceType, params: TrainingParams, wks: number | null): RiskResult {
  let score = 0;
  if ((params.trainingDays || 4) >= 6) score += 2;
  else if ((params.trainingDays || 4) >= 5) score += 1;

  if (wks && race) {
    const ratio = wks / race.minW;
    if (ratio < 1.1) score += 2;
    else if (ratio < 1.3) score += 1;
  }

  if (params.fitnessLevel === "beginner") score += 2;
  else if (params.fitnessLevel === "intermediate") score += 1;

  if (params.experience === "First time") score += 1;
  if (params.injuries) score += 1;
  if (race?.cat === "ultra" || race?.id === "ironman") score += 1;

  if (
    (params.specificRace?.difficulty === "brutal" || params.specificRace?.difficulty === "hilly") &&
    params.fitnessLevel !== "advanced" &&
    params.fitnessLevel !== "elite"
  ) {
    score += 1;
  }

  if (score <= 2) {
    return { level: "Low", dots: 1, msg: "Training load looks sustainable. Follow the plan and listen to your body." };
  }
  if (score <= 4) {
    return { level: "Moderate", dots: 2, msg: "A few risk factors flagged. Prioritize sleep and don't skip recovery weeks." };
  }
  return { level: "Elevated", dots: 3, msg: "High load detected. Add a rest day, monitor fatigue, and tell your coach about any niggles immediately." };
}

// ─────────────────────────────────────────────
// TAPER CALCULATOR
// ─────────────────────────────────────────────
export interface TaperWeek {
  label: string;
  pct: number;
  note: string;
}

export function calcTaper(race: RaceType, wks: number | null): TaperWeek[] {
  if (!wks || !race) return [];
  const len =
    (race.cat === "tri" && race.id === "ironman") || (race.cat === "ultra" && (race.id === "100m" || race.id === "100k"))
      ? 3
      : 2;

  return Array.from({ length: len }, (_, i) => {
    const n = len - i;
    const pct = len === 3 ? (n === 3 ? 80 : n === 2 ? 60 : 40) : n === 2 ? 75 : 45;
    return {
      label: n === 1 ? "Race Week" : `Wk ${wks - n + 1}`,
      pct,
      note: n === 1 ? "Race day!" : n === len ? "Begin taper" : "Sharpen up",
    };
  });
}

// ─────────────────────────────────────────────
// RACE PREDICTOR
// ─────────────────────────────────────────────
export interface PredictionResult {
  rough: string;
  likely: string;
  best: string;
  adjusted: boolean;
}

export function calcPredict(race: RaceType, params: TrainingParams): PredictionResult | null {
  if (!race || !params.experience || !params.fitnessLevel) return null;

  const base: Record<string, Record<string, number>> = {
    "5k": { beginner: 42, intermediate: 28, advanced: 22, elite: 17 },
    "10k": { beginner: 75, intermediate: 55, advanced: 44, elite: 35 },
    half: { beginner: 165, intermediate: 120, advanced: 100, elite: 82 },
    marathon: { beginner: 330, intermediate: 240, advanced: 195, elite: 160 },
    "50k": { beginner: 480, intermediate: 360, advanced: 300, elite: 240 },
    "50m": { beginner: 840, intermediate: 660, advanced: 540, elite: 420 },
    "100k": { beginner: 1200, intermediate: 960, advanced: 780, elite: 600 },
    "100m": { beginner: 1800, intermediate: 1440, advanced: 1200, elite: 960 },
    sprint: { beginner: 105, intermediate: 80, advanced: 65, elite: 52 },
    olympic: { beginner: 195, intermediate: 150, advanced: 125, elite: 102 },
    half70: { beginner: 420, intermediate: 330, advanced: 275, elite: 230 },
    ironman: { beginner: 900, intermediate: 720, advanced: 600, elite: 510 },
  };

  const sr = params.specificRace;
  const b = base[race.id];
  if (!b) return null;

  let mid = b[params.fitnessLevel] || b.intermediate;

  if (sr) {
    if (sr.difficulty === "brutal") mid = Math.round(mid * 1.25);
    else if (sr.difficulty === "hilly") mid = Math.round(mid * 1.12);
    else if (sr.difficulty === "rolling") mid = Math.round(mid * 1.05);
  }

  const fmt = (m: number) => {
    const h = Math.floor(m / 60);
    const mn = m % 60;
    return h > 0 ? `${h}h ${mn}m` : `${mn}m`;
  };

  return {
    rough: fmt(Math.round(mid * 1.15)),
    likely: fmt(mid),
    best: fmt(Math.round(mid * 0.93)),
    adjusted: !!(sr && sr.difficulty !== "flat"),
  };
}

// ─────────────────────────────────────────────
// PLAN STATS
// ─────────────────────────────────────────────
export function planStats(race: RaceType, params: TrainingParams, wks: number | null) {
  const hrs = (params.trainingDays * (race.cat === "tri" ? 1.6 : 1.15)).toFixed(0);
  const hrsMax = (params.trainingDays * (race.cat === "tri" ? 2.2 : 1.7)).toFixed(0);
  const peaks: Record<string, string> = {
    marathon: "22 mi", half: "13 mi", "10k": "8 mi", "5k": "5 mi",
    ironman: "112mi bike", half70: "56mi bike",
    "50k": "26 mi", "50m": "35 mi", "100k": "45 mi", "100m": "60 mi",
    olympic: "25mi bike", sprint: "12mi bike",
  };
  return [
    { label: "Weeks", val: wks?.toString() || "—" },
    { label: "Days/Wk", val: params.trainingDays.toString() },
    { label: "Hrs/Wk", val: `${hrs}–${hrsMax}` },
    { label: "Peak", val: peaks[race.id] || "—" },
  ];
}

// ─────────────────────────────────────────────
// PROFILE BUILDER (for AI prompts)
// ─────────────────────────────────────────────
export function mkProf(race: RaceType, p: TrainingParams, wks: number | null): string {
  const sr = p.specificRace;
  const courseNote = sr
    ? `|SpecificRace:${sr.name} in ${sr.loc}|Elevation:${fmtElev(sr.elevGain)} gain|Difficulty:${sr.difficulty}|Surface:${sr.surface}|CourseTags:${sr.tags?.join(",") || ""}|`
    : "";
  return `Race:${race.name}(${race.dist})${courseNote}|Start:${fmtDate(p.startDate) || "ASAP"}|RaceDate:${p.raceDate ? fmtDate(p.raceDate) : "open"}|Window:${wks ? wks + "wks" : "open"}|Days/wk:${p.trainingDays}|Exp:${p.experience}|Level:${p.fitnessLevel}|Goal:${p.goalTime || "finish"}|Injuries:${p.injuries || "none"}${race.cat === "tri" ? `|Strong:${p.triStrength || "—"}|Weak:${p.triWeakness || "—"}` : ""}`;
}

// ─────────────────────────────────────────────
// MARKDOWN PARSER (simple)
// ─────────────────────────────────────────────
export function mdParse(t: string): string {
  if (!t) return "";
  return t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-5 mb-2 pb-1 border-b border-border">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-primary mt-5 mb-2">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-1 list-none before:content-[\'▸_\'] before:text-orange-400">$1</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// ─────────────────────────────────────────────
// SECTION EXTRACTOR
// ─────────────────────────────────────────────
export function extractSection(content: string, heading: string): string {
  if (!content) return "";
  const lines = content.split("\n");
  let on = false;
  const out: string[] = [];
  for (const l of lines) {
    if (l.includes(heading)) { on = true; continue; }
    if (on && l.startsWith("## ") && !l.includes(heading)) break;
    if (on) out.push(l);
  }
  return out.join("\n").trim() || content.slice(0, 600);
}
