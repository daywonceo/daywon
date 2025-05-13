
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { hapticLight } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

const HapticButton = () => {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const { toast } = useToast();

  const toggleHaptics = () => {
    if (hapticsEnabled) {
      hapticLight();
    }
    
    setHapticsEnabled(!hapticsEnabled);
    
    toast({
      title: hapticsEnabled ? "Haptic feedback disabled" : "Haptic feedback enabled",
      duration: 2000,
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleHaptics}
      className="text-green-800 dark:text-green-200"
    >
      {hapticsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
      <span className="sr-only">Toggle haptics</span>
    </Button>
  );
};

export default HapticButton;
