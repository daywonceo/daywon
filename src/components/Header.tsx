
import { Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import HapticButton from "./HapticButton";
import { useEffect, useState } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import HabitAddSheet from "@/components/habit/HabitAddSheet";

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
        className={`py-4 sm:py-6 px-4 sm:px-5 flex items-center justify-between max-w-3xl mx-auto w-full border-b border-green-100 dark:border-green-800 sticky bg-white dark:bg-gray-900 z-10 transition-all duration-300 ${show ? 'top-0' : '-top-24'}`}
      >
        <div className="flex-1 flex items-center">
          {!isMobile && (
            <div className="relative w-full max-w-[180px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 py-1 pr-2 bg-gray-50 dark:bg-gray-800 rounded-full text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-300 dark:focus:ring-green-700"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter flex items-center">
          Day<span className="tracking-[-0.1em] text-green-700 dark:text-green-500">Won</span>
        </h1>

        <div className="flex-1 flex justify-end items-center space-x-1">
          <ThemeToggle />
          <HapticButton />
          <HabitAddSheet
            trigger={
              <Button 
                variant="outline" 
                className="text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0"
                size="icon"
                aria-label="Add Habit"
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
