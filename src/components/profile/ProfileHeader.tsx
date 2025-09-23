
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Trophy, Users, Calendar } from "lucide-react";

interface ProfileData {
  name: string;
  username: string;
  avatar: string;
  friendCount: number;
  daysActive: number;
  totalHabitsCompleted: number;
}

interface ProfileHeaderProps {
  profile: ProfileData;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <Card className="mb-6 border-green-200 dark:border-green-800 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24">
              <AspectRatio ratio={1/1}>
                <Avatar className="w-full h-full border-4 border-green-200 dark:border-green-800">
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </AspectRatio>
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">{profile.friendCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Friends</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-600">{profile.daysActive}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Days Active</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-purple-600">{profile.totalHabitsCompleted}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
