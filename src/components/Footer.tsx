
import { Grid2x2, Calendar as CalendarIcon, Book, MessageSquare, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticLight } from "@/utils/haptics";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveTab("home");
    else if (path === "/calendar") setActiveTab("calendar");
    else if (path === "/social") setActiveTab("social");
    else if (path === "/profile") setActiveTab("profile");
    else if (path === "/guidance") setActiveTab("guidance");
    
  }, [location]);
  
  const tabs = [
    { id: "home", icon: Grid2x2, label: "Home", path: "/" },
    { id: "calendar", icon: CalendarIcon, label: "Calendar", path: "/calendar" },
    { id: "social", icon: MessageSquare, label: "Social", path: "/social" },
    { id: "guidance", icon: Book, label: "Guidance", path: "/guidance" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];
  
  const handleTabChange = (tabId: string, path: string) => {
    if (activeTab !== tabId) {
      setActiveTab(tabId);
      hapticLight(); // Add haptic feedback when changing tabs
      navigate(path);
    }
  };
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 glass-card border-t safe-area-bottom">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-2 sm:px-4 py-2 gap-1" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={cn(
              "flex flex-col items-center py-2 px-2 sm:px-3 rounded-md interactive-subtle focus-ring-enhanced touch-target-sm flex-1 min-w-0",
              activeTab === tab.id 
                ? "text-primary bg-primary/10 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            aria-label={`Navigate to ${tab.label}`}
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => handleTabChange(tab.id, tab.path)}
          >
            <tab.icon size={isMobile ? 22 : 24} className="flex-shrink-0" />
            <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 truncate w-full">{tab.label}</span>
          </button>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
