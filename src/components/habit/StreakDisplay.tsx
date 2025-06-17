
import React from "react";

interface StreakDisplayProps {
  currentStreak: number;
  className?: string;
}

const StreakDisplay = ({ currentStreak, className = "" }: StreakDisplayProps) => {
  const getStreakDisplay = () => {
    if (currentStreak === 0) {
      return "Start your streak!";
    }
    
    if (currentStreak === 1) {
      return "🔥 1-day streak";
    }
    
    if (currentStreak >= 7) {
      return `🏆 Streak: ${currentStreak}`;
    }
    
    return `🔥 ${currentStreak}-day streak`;
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return "text-gray-500";
    if (currentStreak < 3) return "text-orange-500";
    if (currentStreak < 7) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className={`text-sm font-medium ${getStreakColor()} ${className}`}>
      {getStreakDisplay()}
    </div>
  );
};

export default StreakDisplay;
