
import { Grid2x2, Calendar, Settings, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Footer = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();
  
  const tabs = [
    { id: "home", icon: Grid2x2, label: "Home" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-green-100 bg-white shadow-lg z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-8 py-1 sm:py-2">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={cn(
              "flex flex-col items-center py-1 sm:py-2 px-3 sm:px-4 rounded-md transition-colors",
              activeTab === tab.id ? "text-green-700" : "text-gray-500"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={isMobile ? 20 : 24} />
            <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">{tab.label}</span>
          </button>
        ))}
        
        <button className="flex flex-col items-center py-1 sm:py-2 px-3 sm:px-4">
          <div className="bg-green-700 rounded-full p-0.5 sm:p-1 -mt-6 sm:-mt-8 shadow-md">
            <PlusCircle size={isMobile ? 26 : 32} className="text-white" />
          </div>
          <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-gray-500">Add</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
