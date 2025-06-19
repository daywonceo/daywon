
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface Friend {
  name: string;
  avatar: string;
  topHabit: string;
}

interface BestFriendsProps {
  bestFriends: Friend[];
}

const BestFriends = ({ bestFriends }: BestFriendsProps) => {
  const handleFriendTap = (friendName: string) => {
    toast.info(`Opening ${friendName}'s profile`);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-bold">Best Friends</h3>
      </div>
      
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between space-x-4">
            {bestFriends.map((friend, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
                onClick={() => handleFriendTap(friend.name)}
              >
                <Avatar className="w-16 h-16 mb-2 border-2 border-green-200 dark:border-green-800">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-center mb-1">{friend.name.split(' ')[0]}</p>
                <Badge variant="secondary" className="text-xs">{friend.topHabit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BestFriends;
