import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";

interface MemberCardProps {
  member: {
    id: number;
    name: string;
    avatar: string;
    initials: string;
    topHabits: string[];
    streak: number;
  };
  currentUserId?: number;
  showInviteButton?: boolean;
  onMessage?: (memberId: number) => void;
  onInvite?: (memberId: number) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  currentUserId, 
  showInviteButton = false,
  onMessage,
  onInvite 
}) => {
  const isCurrentUser = member.id === currentUserId;

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3 last:mb-0">
      <div className="flex items-start space-x-3">
        {/* Profile Picture */}
        <Avatar className="h-14 w-14 border-2 border-gray-200 dark:border-gray-600">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-green-400 to-blue-500 text-white">
            {member.initials}
          </AvatarFallback>
        </Avatar>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                {member.name}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-orange-500">🔥</span>
                <span className="text-orange-500 font-medium text-sm">
                  {member.streak} day streak
                </span>
              </div>
            </div>
          </div>

          {/* Habit Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {member.topHabits.slice(0, 3).map((habit, index) => (
              <Badge
                key={index}
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs px-2.5 py-1 font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                {habit}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <div className="flex space-x-2">
              <Button
                onClick={() => onMessage?.(member.id)}
                className="flex-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white h-10 rounded-full font-medium"
              >
                <MessageCircle size={16} className="mr-2" />
                Message
              </Button>
              
              {showInviteButton && (
                <Button
                  onClick={() => onInvite?.(member.id)}
                  className="flex-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white h-10 rounded-full font-medium"
                >
                  <Send size={16} className="mr-2" />
                  Invite
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;