import React, { useState, useMemo } from "react";
import { RACE_TYPES, RACE_DB, type RaceType, type RaceEvent } from "@/data/raceData";
import { fmtDate, fmtElev } from "@/utils/raceHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mountain, Calendar, ChevronRight, Filter } from "lucide-react";

interface RaceBrowserProps {
  onSelectRace: (type: RaceType, event?: RaceEvent) => void;
}

const CATS = [
  { id: "all", label: "All" },
  { id: "run", label: "Running" },
  { id: "ultra", label: "Ultra" },
  { id: "tri", label: "Triathlon" },
];

const RaceBrowser: React.FC<RaceBrowserProps> = ({ onSelectRace }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selectedType, setSelectedType] = useState<RaceType | null>(null);

  const filteredTypes = useMemo(() => {
    return RACE_TYPES.filter(
      (t) => catFilter === "all" || t.cat === catFilter || (catFilter === "run" && ["run"].includes(t.cat))
    );
  }, [catFilter]);

  const filteredEvents = useMemo(() => {
    if (!selectedType) return [];
    return RACE_DB.filter((e) => {
      const matchesType = e.typeId === selectedType.id;
      const matchesSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.loc.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [selectedType, search]);

  if (selectedType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
            ← Back
          </Button>
          <h2 className="text-lg font-bold text-foreground">
            {selectedType.icon} {selectedType.name} Events
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by name, location, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Option to use type without specific event */}
        <Card
          className="border-dashed border-primary/40 cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => onSelectRace(selectedType)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Generic {selectedType.name} Plan</p>
              <p className="text-sm text-muted-foreground">
                No specific event — just train for the distance ({selectedType.dist})
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => onSelectRace(selectedType, event)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{event.icon}</span>
                      <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.loc}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {fmtDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mountain className="h-3 w-3" /> {fmtElev(event.elevGain)} gain
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant={event.difficulty === "brutal" ? "destructive" : event.difficulty === "hilly" ? "default" : "secondary"} className="text-xs">
                        {event.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{event.surface}</Badge>
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredEvents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No events found. Try a different search.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Choose Your Race</h2>
        <p className="text-sm text-muted-foreground">Pick a distance, then select a specific event or go generic.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2">
        {CATS.map((c) => (
          <Button
            key={c.id}
            variant={catFilter === c.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCatFilter(c.id)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Race type cards */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTypes.map((type) => {
          const eventCount = RACE_DB.filter((e) => e.typeId === type.id).length;
          return (
            <Card
              key={type.id}
              className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
              onClick={() => setSelectedType(type)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{type.icon}</div>
                <h3 className="font-bold text-foreground text-sm">{type.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{type.dist}</p>
                <p className="text-xs text-muted-foreground italic">{type.tag}</p>
                <p className="text-xs text-primary mt-2">{eventCount} events →</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RaceBrowser;
