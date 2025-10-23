
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { cn } from "@/lib/utils";
import { SPACING } from "@/utils/designSystem";

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

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter flex items-center flex-shrink-0">
          Day<span className="tracking-[-0.1em] text-gradient-primary">Won</span>
        </h1>

        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-1.5 min-w-0">
          <ThemeToggle />
          <HabitAddSheet
            trigger={
              <Button 
                variant="glass" 
                className="hover:bg-primary/10 hover:border-primary/30 rounded-full"
                size="icon-sm"
                aria-label="Add new habit"
              >
                <Plus size={isMobile ? 18 : 20} />
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
