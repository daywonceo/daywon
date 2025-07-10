import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Flame, Send, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

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

interface ChallengeDetailProps {
  challenge: Challenge;
  onBack: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onLeaveChallenge: () => void;
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challenge,
  onBack,
  newMessage,
  setNewMessage,
  onSendMessage,
  onLeaveChallenge
}) => {
  const sortedParticipants = [...challenge.participants].sort((a, b) => b.progress - a.progress);
  const userRank = challenge.joined ? challenge.rank : null;

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
        {challenge.joined && (
          <Button variant="outline" size="sm" onClick={onLeaveChallenge}>
            Leave
          </Button>
        )}
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
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="text-yellow-500" size={16} />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Leaderboard</h4>
          </div>
          <div className="space-y-3">
            {sortedParticipants.map((participant, index) => (
              <div key={participant.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {participant.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        <Flame size={10} className="mr-1" />
                        {participant.dayStreak}
                      </Badge>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {participant.dayStreak}/{participant.totalDays}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <Progress value={participant.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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