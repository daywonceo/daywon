
import { Grid2x2, Calendar as CalendarIcon, Book, MessageSquare, User } from "lucide-react";
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
    else if (path === "/guidance") setActiveTab("settings");
  }, [location]);
  
  const tabs = [
    { id: "home", icon: Grid2x2, label: "Home", path: "/" },
    { id: "calendar", icon: CalendarIcon, label: "Calendar", path: "/calendar" },
    { id: "social", icon: MessageSquare, label: "Social", path: "/social" },
    { id: "settings", icon: Book, label: "Guidance", path: "/guidance" },
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
    <footer className="fixed bottom-0 left-0 right-0 border-t border-green-100 dark:border-green-800 bg-white dark:bg-gray-900 shadow-lg z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-8 py-1 sm:py-2">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={cn(
              "flex flex-col items-center py-1 sm:py-2 px-3 sm:px-4 rounded-md transition-colors",
              activeTab === tab.id 
                ? "text-green-700 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
            )}
            onClick={() => handleTabChange(tab.id, tab.path)}
          >
            <tab.icon size={isMobile ? 20 : 24} />
            <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
