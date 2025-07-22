import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Flame, Send, Users, Clock, Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import MemberCard from "./MemberCard";
import { useToast } from "@/hooks/use-toast";

interface ChallengeParticipant {
  id: number;
  name: string;
  avatar: string;
  progress: number;
  dayStreak: number;
  totalDays: number;
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

interface Challenge {
  id: number;
  title: string;
  habit: string;
  duration: string;
  participants: ChallengeParticipant[];
  progress: number;
  rank: number;
  totalParticipants: number;
  timeRemaining: string;
  joined: boolean;
  communityId: number;
  chatMessages: ChatMessage[];
}

interface User {
  id: number;
  name: string;
  avatar: string;
  initials: string;
  topHabits: string[];
  streak: number;
}

interface ChallengeDetailProps {
  challenge: Challenge;
  onBack: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onLeaveChallenge: () => void;
  onInvite?: (challenge: Challenge) => void;
  onViewAllMembers: (title: string, members: User[]) => void;
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challenge,
  onBack,
  newMessage,
  setNewMessage,
  onSendMessage,
  onLeaveChallenge,
  onInvite,
  onViewAllMembers
}) => {
  const { toast } = useToast();
  const currentUserId = 1; // Mock current user ID
  const sortedParticipants = [...challenge.participants].sort((a, b) => b.progress - a.progress);
  const userRank = challenge.joined ? challenge.rank : null;

  // Convert participants to member format for MemberCard
  const participantsAsMembers = sortedParticipants.map(participant => ({
    id: participant.id,
    name: participant.name,
    avatar: participant.avatar,
    initials: participant.name.split(' ').map(n => n[0]).join(''),
    topHabits: [challenge.habit],
    streak: participant.dayStreak
  }));

  const handleMemberMessage = (memberId: number) => {
    toast({
      title: "Message Sent!",
      description: "Your message has been delivered.",
    });
  };

  const handleMemberInvite = (memberId: number) => {
    toast({
      title: "Invitation Sent!",
      description: "Your invitation has been sent to this participant.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{challenge.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{challenge.habit}</span>
              <span>•</span>
              <span>{challenge.duration}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onInvite && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onInvite(challenge)}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Share size={14} />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}
          {challenge.joined && (
            <Button variant="outline" size="sm" onClick={onLeaveChallenge}>
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Challenge Stats */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {challenge.participants.length}
              </div>
              <p className="text-xs text-gray-500">Participants</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {challenge.timeRemaining.split(' ')[0]}
              </div>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            {challenge.joined && (
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  #{challenge.rank}
                </div>
                <p className="text-xs text-gray-500">Your Rank</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

  {/* Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="text-yellow-500" size={18} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leaderboard</h2>
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onViewAllMembers(`${challenge.title} Participants`, participantsAsMembers)}
            className="text-xs text-blue-500 hover:text-blue-600 h-6 px-2"
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {sortedParticipants.slice(0, 3).map((participant, index) => {
            const memberData = participantsAsMembers.find(m => m.id === participant.id);
            if (!memberData) return null;
            
            return (
              <div key={participant.id} className="relative">
                {/* Rank Badge */}
                <div className="absolute -left-2 top-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white dark:border-gray-900 shadow-sm">
                  <span className="text-xs font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
                
                {/* Enhanced Member Card with Progress */}
                <div className="ml-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    {/* Profile Picture */}
                    <Avatar className="h-14 w-14 border-2 border-gray-200 dark:border-gray-600">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-green-400 to-blue-500 text-white">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                            {participant.name}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-orange-500">🔥</span>
                            <span className="text-orange-500 font-medium text-sm">
                              {participant.dayStreak} day streak
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {participant.dayStreak}/{participant.totalDays} days
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{participant.progress}%</span>
                        </div>
                        <Progress value={participant.progress} className="h-2" />
                      </div>

                      {/* Habit Tag */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge
                          className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs px-2.5 py-1 font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          {challenge.habit}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      {participant.id !== currentUserId && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleMemberMessage(participant.id)}
                            className="flex-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white h-10 rounded-full font-medium"
                          >
                            <Send size={16} className="mr-2" />
                            Message
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Chat */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Challenge Chat</h4>
          <div className="space-y-3 mb-4">
            {challenge.chatMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar} alt={message.userName} />
                  <AvatarFallback className="text-xs">
                    {message.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
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
          {challenge.joined && (
            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Input
                placeholder="Encourage your teammates..."
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

export default ChallengeDetail;