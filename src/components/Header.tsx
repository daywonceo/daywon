
import { Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import HapticButton from "./HapticButton";
import { useEffect, useState } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { cn } from "@/lib/utils";

const Header = () => {
  const isMobile = useIsMobile();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  // Handle new habit selected
  const handleHabitSelected = (habit: string) => {
    // Implement logic when a habit is chosen (toast, add, etc.)
    // Optionally: toast({ title: habit + " added!" });
  };

  return (
    <SettingsProvider>
      <header 
        className={cn(
          "py-3 sm:py-4 px-responsive flex items-center justify-between gap-2 max-w-4xl mx-auto w-full sticky z-10 transition-all duration-300",
          "glass-card border-b",
          show ? 'top-0' : '-top-24'
        )}
      >
        <div className="flex-1 flex items-center min-w-0">
          {!isMobile && (
            <div className="relative w-full max-w-[180px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 py-2 pr-2 min-h-[36px] bg-muted/50 dark:bg-muted rounded-full text-sm w-full focus-ring-enhanced transition-all duration-200 hover:bg-muted/70"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search habits and activities"
              />
            </div>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter flex items-center flex-shrink-0">
          Day<span className="tracking-[-0.1em] text-gradient-primary">Won</span>
        </h1>

        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-1.5 min-w-0">
          <ThemeToggle />
          <HapticButton />
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
