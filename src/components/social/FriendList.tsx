
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Friend {
  id: number;
  name: string;
  avatar: string;
}

interface FriendListProps {
  friends: Friend[];
}

const FriendList = ({ friends }: FriendListProps) => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input 
          placeholder="SEARCH FRIENDS" 
          className="max-w-[65%] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />
        <Button className="bg-green-700 hover:bg-green-800">
          <UserPlus className="mr-1" size={18} /> +ADD
        </Button>
      </div>
      
      <div className="space-y-4 mt-6">
        {friends.map(friend => (
          <div key={friend.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">{friend.name}</span>
            </div>
            <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-2">
              <MessageCircle size={18} />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default FriendList;
