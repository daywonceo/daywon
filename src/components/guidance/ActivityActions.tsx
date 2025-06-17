
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";

interface BoredActivity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: number;
}

interface ActivityActionsProps {
  activity: BoredActivity | null;
  isLoading: boolean;
  onTryThis: () => void;
  onSuggestAnother: () => void;
}

const ActivityActions = ({ activity, isLoading, onTryThis, onSuggestAnother }: ActivityActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button 
        onClick={onTryThis}
        disabled={!activity || isLoading}
        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
      >
        <Check className="w-4 h-4" />
        Try This
      </Button>
      
      <Button 
        onClick={onSuggestAnother}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        Suggest Another
      </Button>
    </div>
  );
};

export default ActivityActions;
