
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { cn } from "@/lib/utils";
import { SPACING } from "@/utils/designSystem";
import dayWonLogo from "@/assets/day-won-logo.png";

const Header = () => {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(true);

  const handleHabitSelected = (habit: string) => {
    // Implement logic when a habit is chosen
  };

  return (
    <SettingsProvider>
      <header 
        className={cn(
          SPACING.responsive.page,
          "py-3 sm:py-4 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full sticky z-10 transition-all duration-300 glass-card border-b",
          show ? 'top-0' : '-top-24'
        )}
      >
        <div className="flex-1 flex items-center min-w-0 gap-2">
          {/* Spacer for layout balance */}
        </div>

        <img 
          src={dayWonLogo} 
          alt="Day Won" 
          className="h-32 sm:h-36 md:h-40 w-auto flex-shrink-0 -my-4"
        />

        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 min-w-0">
          <ThemeToggle />
          <HabitAddSheet
            trigger={
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 rounded-full font-medium"
                size={isMobile ? "sm" : "default"}
                aria-label="Add new habit"
              >
                <Plus size={isMobile ? 16 : 18} className="mr-1" />
                {isMobile ? "Add" : "Add Habit"}
              </Button>
            }
            onHabitSelected={handleHabitSelected}
          />
        </div>
      </header>
    </SettingsProvider>
  );
};

export default Header;
