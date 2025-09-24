
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface MembershipMilestoneProps {
  daysActive: number;
}

const MembershipMilestone = ({ daysActive }: MembershipMilestoneProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Membership</h3>
      </div>
      
      <Card className="glass-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
        {/* Enhanced background with multiple gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors duration-500"></div>
        <div className="absolute bottom-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors duration-500 delay-200"></div>
        
        <CardContent className="p-6 text-center relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Calendar className="w-12 h-12 mx-auto text-primary group-hover:scale-110 transition-transform duration-300 relative z-10" />
          </div>
          
          <h3 className="font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
            Member Since Day Won
          </h3>
          
          <p className="text-3xl font-bold tracking-wider mb-3 text-primary group-hover:scale-105 transition-transform duration-300">
            {daysActive} DAYS STRONG!
          </p>
          
          <p className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full inline-block">
            Keep up the amazing consistency!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MembershipMilestone;
