
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame } from "lucide-react";

interface PersonalBestsProps {
  habitScore: {
    totalScore: number;
  };
  mostConsistentHabit: string;
}

const PersonalBests = ({ habitScore, mostConsistentHabit }: PersonalBestsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Personal Bests</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Trophy className="w-8 h-8 mx-auto text-primary group-hover:scale-110 transition-transform duration-300 relative z-10" />
            </div>
            <h4 className="text-xs font-bold mb-2 text-muted-foreground tracking-wide">HABIT SCORE</h4>
            <p className="text-3xl font-bold text-primary mb-1 group-hover:text-primary/90 transition-colors">{Math.round(habitScore.totalScore)}</p>
            <p className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">MONTHLY</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card group hover:scale-105 transition-all duration-300 delay-75 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 text-center relative z-10">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Flame className="w-8 h-8 mx-auto text-primary group-hover:scale-110 transition-transform duration-300 relative z-10" />
            </div>
            <h4 className="text-xs font-bold mb-2 text-muted-foreground tracking-wide">TOP HABIT</h4>
            <p className="text-lg font-bold text-primary mb-1 group-hover:text-primary/90 transition-colors line-clamp-1">{mostConsistentHabit}</p>
            <p className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">MOST CONSISTENT</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalBests;
