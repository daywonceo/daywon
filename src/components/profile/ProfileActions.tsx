
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Share2, LogOut, RefreshCcw } from "lucide-react";

interface ProfileActionsProps {
  onOpenSettings: () => void;
  onSignOut: () => void;
}

const ProfileActions = ({ onOpenSettings, onSignOut }: ProfileActionsProps) => {
  const handleStartOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('onboardingData');
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        variant="outline" 
        className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
        onClick={onOpenSettings}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      <Button 
        variant="outline" 
        className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <Button 
        variant="outline" 
        className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        onClick={handleStartOnboarding}
      >
        <RefreshCcw className="w-4 h-4 mr-2" />
        Restart Onboarding
      </Button>
      <Button 
        variant="outline" 
        className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileActions;
