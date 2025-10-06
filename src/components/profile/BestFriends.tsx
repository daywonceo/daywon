
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { FriendManagementDialog } from "@/components/social/FriendManagementDialog";

interface Friend {
  name: string;
  avatar: string;
  topHabit: string;
}

interface BestFriendsProps {
  bestFriends: Friend[];
}

const BestFriends = ({ bestFriends }: BestFriendsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleFriendTap = (friendName: string) => {
    toast.info(`Opening ${friendName}'s profile`);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Best Friends</h3>
          </div>
          {bestFriends.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              View All
            </Button>
          )}
        </div>
      
      <Card className="glass-card group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          {bestFriends.length > 0 ? (
            <div className="flex justify-between space-x-4">
              {bestFriends.map((friend, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center flex-1 cursor-pointer group/friend hover:scale-105 transition-all duration-300 rounded-xl p-3 hover:bg-primary/5"
                  onClick={() => handleFriendTap(friend.name)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover/friend:opacity-100 transition-opacity duration-300"></div>
                    <Avatar className="w-16 h-16 border-3 border-primary/30 group-hover/friend:border-primary/50 transition-colors duration-300 relative z-10">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm font-semibold text-center mb-2 text-foreground group-hover/friend:text-primary transition-colors">{friend.name.split(' ')[0]}</p>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 group-hover/friend:bg-primary/20">{friend.topHabit}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No friends yet</p>
              <p className="text-sm text-muted-foreground">Start connecting with other users!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    <FriendManagementDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      defaultTab="friends"
    />
    </>
  );
};

export default BestFriends;
