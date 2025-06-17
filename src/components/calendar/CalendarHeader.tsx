
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Time Period</h3>
            <p className="text-sm text-gray-500">Choose your view range</p>
          </div>
        </div>
        
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-150 transition-all duration-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-xl rounded-lg">
            <SelectItem value="current" className="hover:bg-green-50 focus:bg-green-50">
              Current Month
            </SelectItem>
            <SelectItem value="6months" className="hover:bg-green-50 focus:bg-green-50">
              Last 6 Months
            </SelectItem>
            <SelectItem value="year" className="hover:bg-green-50 focus:bg-green-50">
              Last Year
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarHeader;
