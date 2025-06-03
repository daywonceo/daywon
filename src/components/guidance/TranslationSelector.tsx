
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const translations = [
  { id: "esv", name: "English Standard Version", code: "ESV" },
  { id: "niv", name: "New International Version", code: "NIV" },
  { id: "nlt", name: "New Living Translation", code: "NLT" },
  { id: "web", name: "World English Bible", code: "WEB" },
  { id: "kjv", name: "King James Version", code: "KJV" },
  { id: "nasb", name: "New American Standard Bible", code: "NASB" }
];

interface TranslationSelectorProps {
  currentTranslation: string;
  onTranslationChange: (translation: string) => void;
}

const TranslationSelector = ({ currentTranslation, onTranslationChange }: TranslationSelectorProps) => {
  return (
    <Select value={currentTranslation} onValueChange={onTranslationChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select translation" />
      </SelectTrigger>
      <SelectContent>
        {translations.map((translation) => (
          <SelectItem key={translation.id} value={translation.id}>
            {translation.name} ({translation.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TranslationSelector;
