
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, MessageCircle, Search, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { isPreviewMode, mockFriendsData } from "./mockSocialData";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  status?: string;
  mutualHabits?: number;
}

interface FriendListProps {
  friends: Friend[];
}

const FriendList = ({ friends }: FriendListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use mock data if in preview mode, otherwise use provided friends
  const displayFriends = isPreviewMode ? mockFriendsData : friends;
  
  const filteredFriends = displayFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Active now';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Last seen recently';
      default:
        return 'Active today';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
          <Users className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Friends</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Connect and motivate each other</p>
        {isPreviewMode && (
          <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full inline-block">
            Preview Mode - Mock Data
          </div>
        )}
      </div>

      {/* Add Friend Button */}
      <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shadow-sm">
        <UserPlus className="mr-2" size={16} /> Add New Friend
      </Button>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search friends..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700"
        />
      </div>
      
      {/* Friends List */}
      <div className="space-y-3">
        {filteredFriends.map(friend => (
          <Card key={friend.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-800/50">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold">
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {friend.status && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(friend.status)} border-2 border-white dark:border-gray-800 rounded-full`}></div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{friend.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getStatusText(friend.status)}
                      {friend.mutualHabits && ` • ${friend.mutualHabits} mutual habits`}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <MessageCircle size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* No Results */}
      {filteredFriends.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">🔍</div>
          <p className="text-sm text-gray-500">No friends found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Empty State */}
      {displayFriends.length === 0 && !isPreviewMode && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">👥</div>
          <p className="text-sm text-gray-500">You haven't added any friends yet</p>
          <p className="text-xs text-gray-400 mt-1">Start connecting with others!</p>
        </div>
      )}
    </div>
  );
};

export default FriendList;
