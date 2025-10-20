
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Heart } from "lucide-react";

interface ActivityFiltersProps {
  selectedMood: string;
  selectedEnergy: string;
  selectedTime: string;
  onMoodChange: (mood: string) => void;
  onEnergyChange: (energy: string) => void;
  onTimeChange: (time: string) => void;
}

const moods = [
  { id: "all", name: "Any Mood", emoji: "😊" },
  { id: "stressed", name: "Stressed", emoji: "😰" },
  { id: "lonely", name: "Lonely", emoji: "😔" },
  { id: "restless", name: "Restless", emoji: "😤" },
  { id: "creative", name: "Creative", emoji: "🎨" },
  { id: "productive", name: "Productive", emoji: "⚡" }
];

const energyLevels = [
  { id: "all", name: "Any Energy", emoji: "⚡" },
  { id: "low", name: "Low Energy", emoji: "😴" },
  { id: "medium", name: "Medium Energy", emoji: "🚶" },
  { id: "high", name: "High Energy", emoji: "🏃" }
];

const timeRanges = [
  { id: "all", name: "Any Time", emoji: "⏰" },
  { id: "quick", name: "5-10 mins", emoji: "⚡" },
  { id: "short", name: "15-30 mins", emoji: "🕐" },
  { id: "medium", name: "30-60 mins", emoji: "🕑" }
];

const ActivityFilters = ({
  selectedMood,
  selectedEnergy,
  selectedTime,
  onMoodChange,
  onEnergyChange,
  onTimeChange
}: ActivityFiltersProps) => {
  const currentMood = moods.find(m => m.id === selectedMood) || moods[0];
  const currentEnergy = energyLevels.find(e => e.id === selectedEnergy) || energyLevels[0];
  const currentTime = timeRanges.find(t => t.id === selectedTime) || timeRanges[0];

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-pink-500" />
        <Select value={selectedMood} onValueChange={onMoodChange}>
          <SelectTrigger className="w-36">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentMood.emoji}</span>
                <span className="text-xs">{currentMood.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {moods.map((mood) => (
              <SelectItem key={mood.id} value={mood.id}>
                <div className="flex items-center gap-2">
                  <span>{mood.emoji}</span>
                  <span className="text-xs">{mood.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-warning" />
        <Select value={selectedEnergy} onValueChange={onEnergyChange}>
          <SelectTrigger className="w-36">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentEnergy.emoji}</span>
                <span className="text-xs">{currentEnergy.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {energyLevels.map((energy) => (
              <SelectItem key={energy.id} value={energy.id}>
                <div className="flex items-center gap-2">
                  <span>{energy.emoji}</span>
                  <span className="text-xs">{energy.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <Select value={selectedTime} onValueChange={onTimeChange}>
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentTime.emoji}</span>
                <span className="text-xs">{currentTime.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((time) => (
              <SelectItem key={time.id} value={time.id}>
                <div className="flex items-center gap-2">
                  <span>{time.emoji}</span>
                  <span className="text-xs">{time.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ActivityFilters;
