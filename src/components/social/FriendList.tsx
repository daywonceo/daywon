
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Friends</h2>
        <Button className="bg-green-700 hover:bg-green-800 shadow-sm">
          <UserPlus className="mr-2" size={16} /> Add Friend
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search friends..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />
      </div>
      
      <div className="grid gap-4">
        {filteredFriends.map(friend => (
          <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-green-100 dark:ring-green-800">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback className="bg-green-100 text-green-800">{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{friend.name}</span>
                <p className="text-sm text-gray-500">Active today</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0 border-2 hover:bg-blue-50 hover:border-blue-300">
              <MessageCircle size={16} />
            </Button>
          </div>
        ))}
      </div>
      
      {filteredFriends.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No friends found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default FriendList;
