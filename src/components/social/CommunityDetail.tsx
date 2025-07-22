import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pin, Send, Users, Share } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  avatar: string;
  initials: string;
  topHabits: string[];
  streak: number;
}

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  avatar: string;
  message: string;
  timestamp: string;
  emoji?: string;
}

interface Community {
  id: number;
  name: string;
  description: string;
  members: User[];
  joined: boolean;
  category: string;
  pinnedMessage?: string;
  recentMessages: ChatMessage[];
}

interface CommunityDetailProps {
  community: Community;
  onBack: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onInvite?: (community: Community) => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({
  community,
  onBack,
  newMessage,
  setNewMessage,
  onSendMessage,
  onInvite
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{community.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{community.members.length} members</p>
        </div>
        {onInvite && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onInvite(community)}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Share size={14} />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        )}
      </div>

      {/* Pinned Message */}
      {community.pinnedMessage && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <Pin className="text-amber-600 dark:text-amber-400 mt-0.5" size={14} />
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                {community.pinnedMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users size={16} className="text-gray-600 dark:text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Members</h4>
          </div>
          <div className="space-y-3">
            {community.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs font-medium">{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {member.streak} day streak
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.topHabits.slice(0, 3).map((habit, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                        {habit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Messages</h4>
          <div className="space-y-3 mb-4">
            {community.recentMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar} alt={message.userName} />
                  <AvatarFallback className="text-xs">{message.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {message.userName}
                    </p>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {message.message} {message.emoji}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {community.joined && (
            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                className="flex-1"
              />
              <Button size="sm" onClick={onSendMessage} disabled={!newMessage.trim()}>
                <Send size={14} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDetail;