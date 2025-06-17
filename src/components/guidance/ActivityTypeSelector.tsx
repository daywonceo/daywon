
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activityTypes = [
  { value: "", label: "Any Type" },
  { value: "education", label: "Education" },
  { value: "recreational", label: "Recreational" },
  { value: "social", label: "Social" },
  { value: "diy", label: "DIY" },
  { value: "charity", label: "Charity" },
  { value: "cooking", label: "Cooking" },
  { value: "relaxation", label: "Relaxation" },
  { value: "music", label: "Music" },
  { value: "busywork", label: "Busywork" }
];

interface ActivityTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ActivityTypeSelector = ({ selectedType, onTypeChange }: ActivityTypeSelectorProps) => {
  return (
    <div className="mb-4">
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-48 mx-auto">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {activityTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityTypeSelector;
