
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
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 group h-14 relative overflow-hidden flex items-center justify-center text-center"
        onClick={onOpenSettings}
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center justify-center relative z-10">
          <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm">Settings</span>
        </div>
      </Button>
      
      <Button 
        variant="outline" 
        className="glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 group h-14 relative overflow-hidden flex items-center justify-center text-center"
        onClick={() => window.location.href = '/integrations'}
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center justify-center relative z-10">
          <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm">Integrations</span>
        </div>
      </Button>
      
      <Button 
        variant="outline" 
        className="glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 group h-14 relative overflow-hidden flex items-center justify-center text-center"
        onClick={handleStartOnboarding}
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 text-sm">Restart Onboarding</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="glass-card border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive group h-14 relative overflow-hidden flex items-center justify-center text-center"
        onClick={onSignOut}
      >
        <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center justify-center relative z-10">
          <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm">Sign Out</span>
        </div>
      </Button>
    </div>
  );
};

export default ProfileActions;
