
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Clock, Heart, MessageCircle } from "lucide-react";

interface Community {
  id: number;
  name: string;
  description: string;
  members: number;
  joined: boolean;
  category: string;
}

interface Challenge {
  id: number;
  title: string;
  habit: string;
  duration: string;
  participants: number;
  progress: number;
  rank: number;
  totalParticipants: number;
  timeRemaining: string;
  joined: boolean;
}

interface GroupsProps {}

const Groups = ({}: GroupsProps) => {
  const [activeTab, setActiveTab] = useState<"communities" | "challenges">("communities");

  const communities: Community[] = [
    {
      id: 1,
      name: "MORNING WARRIORS",
      description: "Early risers building better mornings together",
      members: 247,
      joined: true,
      category: "LIFESTYLE"
    },
    {
      id: 2,
      name: "FITNESS FIGHTERS",
      description: "Crushing fitness goals one day at a time",
      members: 189,
      joined: false,
      category: "FITNESS"
    },
    {
      id: 3,
      name: "MINDFUL READERS",
      description: "Growing through daily reading habits",
      members: 156,
      joined: true,
      category: "LEARNING"
    },
    {
      id: 4,
      name: "SPIRITUAL JOURNEY",
      description: "Deepening faith through daily devotions",
      members: 203,
      joined: false,
      category: "SPIRITUAL"
    }
  ];

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "30-DAY WORKOUT STREAK",
      habit: "WORKOUT",
      duration: "30 days",
      participants: 45,
      progress: 67,
      rank: 12,
      totalParticipants: 45,
      timeRemaining: "8 days left",
      joined: true
    },
    {
      id: 2,
      title: "DAILY DEVOTIONS CHALLENGE",
      habit: "DEVOTIONS",
      duration: "21 days",
      participants: 32,
      progress: 0,
      rank: 0,
      totalParticipants: 32,
      timeRemaining: "21 days left",
      joined: false
    },
    {
      id: 3,
      title: "READING MARATHON",
      habit: "READ",
      duration: "14 days",
      participants: 28,
      progress: 85,
      rank: 3,
      totalParticipants: 28,
      timeRemaining: "2 days left",
      joined: true
    }
  ];

  const handleJoinCommunity = (communityId: number) => {
    console.log(`Joining community ${communityId}`);
  };

  const handleJoinChallenge = (challengeId: number) => {
    console.log(`Joining challenge ${challengeId}`);
  };

  const handleSendEncouragement = (challengeId: number) => {
    console.log(`Sending encouragement for challenge ${challengeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("communities")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "communities"
              ? "bg-white dark:bg-gray-700 text-green-700 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          COMMUNITIES
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "challenges"
              ? "bg-white dark:bg-gray-700 text-green-700 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          CHALLENGES
        </button>
      </div>

      {/* Communities Tab */}
      {activeTab === "communities" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            JOIN COMMUNITIES
          </h3>
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-bold text-lg">{community.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {community.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {community.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{community.members} members</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={community.joined ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleJoinCommunity(community.id)}
                    disabled={community.joined}
                    className="ml-4"
                  >
                    {community.joined ? "JOINED" : "JOIN"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            GROUP CHALLENGES
          </h3>
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{challenge.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {challenge.habit} • {challenge.duration}
                      </p>
                    </div>
                    <Button
                      variant={challenge.joined ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={challenge.joined}
                    >
                      {challenge.joined ? "JOINED" : "JOIN"}
                    </Button>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{challenge.timeRemaining}</span>
                    </div>
                  </div>

                  {/* Progress and Ranking (only for joined challenges) */}
                  {challenge.joined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Your Progress</span>
                        <span className="text-sm text-gray-500">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          <Trophy size={16} className="text-yellow-500" />
                          <span className="text-sm font-medium">
                            Rank #{challenge.rank} of {challenge.totalParticipants}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEncouragement(challenge.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Heart size={16} className="mr-1" />
                            Encourage
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-500"
                          >
                            <MessageCircle size={16} className="mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
