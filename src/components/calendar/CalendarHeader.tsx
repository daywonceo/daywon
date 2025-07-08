
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock } from "lucide-react";

interface CalendarHeaderProps {
  title: string;
  activeTab: string;
  currentView: string;
  timePeriod: string;
  setActiveTab: (value: string) => void;
  setCurrentView: (value: string) => void;
  setTimePeriod: (value: string) => void;
}

const CalendarHeader = ({ 
  timePeriod,
  setTimePeriod
}: CalendarHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Time Period</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Choose your view range</p>
          </div>
        </div>
        
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 bg-background border-border hover:bg-accent/50 transition-all duration-200 rounded-lg text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border shadow-lg rounded-lg">
            <SelectItem value="current" className="hover:bg-accent focus:bg-accent text-sm">
              Current Month
            </SelectItem>
            <SelectItem value="6months" className="hover:bg-accent focus:bg-accent text-sm">
              Last 6 Months
            </SelectItem>
            <SelectItem value="year" className="hover:bg-accent focus:bg-accent text-sm">
              Last 12 Months
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarHeader;
