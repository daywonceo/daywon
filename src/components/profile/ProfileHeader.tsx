
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Sparkles } from "lucide-react";
import { DayWonMembersModal } from "./DayWonMembersModal";

interface ProfileData {
  name: string;
  username: string;
  avatar: string;
  friendCount: number;
  daysActive: number;
  totalHabitsCompleted: number;
  isDayWonMember?: boolean;
}

interface ProfileHeaderProps {
  profile: ProfileData;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const [showDayWonMembers, setShowDayWonMembers] = useState(false);
  
  return (
    <Card className={`glass-card group relative overflow-hidden ${
      profile.isDayWonMember 
        ? 'ring-4 ring-warning/60 shadow-[0_0_30px_hsl(var(--warning)/0.3)] border-warning/40' 
        : ''
    }`}>
      {/* Animated background elements */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-700"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-700 delay-300"></div>
      {profile.isDayWonMember && (
        <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-warning/5 pointer-events-none"></div>
      )}
      
      <CardContent className="pt-8 pb-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Enhanced Avatar Section */}
          <div className="relative mb-6 group/avatar">
            <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 ${
              profile.isDayWonMember ? 'bg-warning/30' : 'bg-primary/20'
            }`}></div>
            <div className="w-28 h-28 relative">
              <AspectRatio ratio={1/1}>
                <Avatar className={`w-full h-full border-4 transition-colors duration-300 relative z-10 ${
                  profile.isDayWonMember 
                    ? 'border-warning/60 group-hover/avatar:border-warning/80 shadow-lg shadow-warning/20' 
                    : 'border-primary/30 group-hover/avatar:border-primary/50'
                }`}>
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </AspectRatio>
            </div>
            {/* Animated ring around avatar */}
            <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${
              profile.isDayWonMember ? 'border-warning/40' : 'border-primary/20'
            }`}></div>
          </div>
          
          {/* Enhanced Name Section */}
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{profile.name}</h2>
            <p className="text-muted-foreground bg-muted/50 px-3 py-1 rounded-full text-sm">@{profile.username}</p>
            {profile.isDayWonMember && (
              <div className="flex justify-center">
                <Badge 
                  variant="default" 
                  className="bg-warning text-warning-foreground hover:bg-warning/90 border-0 shadow-lg shadow-warning/30 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setShowDayWonMembers(true)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Day Won Member
                </Badge>
              </div>
            )}
          </div>
          
          <DayWonMembersModal 
            open={showDayWonMembers} 
            onOpenChange={setShowDayWonMembers} 
          />
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
            <div className="text-center group/stat hover:scale-105 transition-transform duration-300">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                <div className="p-3 rounded-full bg-primary/10 group-hover/stat:bg-primary/20 transition-colors duration-300 inline-flex relative z-10">
                  <Users className="w-5 h-5 text-primary group-hover/stat:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-xl font-bold text-primary mb-1">{profile.friendCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Friends</p>
            </div>
            
            <div className="text-center group/stat hover:scale-105 transition-transform duration-300 delay-75">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                <div className="p-3 rounded-full bg-primary/10 group-hover/stat:bg-primary/20 transition-colors duration-300 inline-flex relative z-10">
                  <Calendar className="w-5 h-5 text-primary group-hover/stat:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-xl font-bold text-primary mb-1">{profile.daysActive}</p>
              <p className="text-xs text-muted-foreground font-medium">Days Active</p>
            </div>
            
            <div className="text-center group/stat hover:scale-105 transition-transform duration-300 delay-150">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                <div className="p-3 rounded-full bg-primary/10 group-hover/stat:bg-primary/20 transition-colors duration-300 inline-flex relative z-10">
                  <Trophy className="w-5 h-5 text-primary group-hover/stat:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-xl font-bold text-primary mb-1">{profile.totalHabitsCompleted}</p>
              <p className="text-xs text-muted-foreground font-medium">Challenges</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
