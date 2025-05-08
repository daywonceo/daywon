
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RecentActivities from "@/components/RecentActivities";
import Calendar from "@/components/Calendar";
import HabitStats from "@/components/HabitStats";
import Progress from "@/components/Progress";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState("MARCH");
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <RecentActivities month={currentMonth} />
        <Calendar month={currentMonth} />
        <HabitStats />
        <Progress />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
