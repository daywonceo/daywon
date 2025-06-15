import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Clock, Heart, MessageCircle, Star, Target } from "lucide-react";
import ChallengePlaylist from "./ChallengePlaylist";

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

const Groups = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
          <Target className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Communities & Challenges</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Join groups and compete together</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("communities")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "communities"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          COMMUNITIES
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "challenges"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          CHALLENGES
        </button>
      </div>

      {/* Communities Tab */}
      {activeTab === "communities" && (
        <div className="space-y-4">
          {communities.map((community) => (
            <Card key={community.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{community.name}</h4>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {community.category}
                      </Badge>
                      {community.joined && (
                        <Star className="text-yellow-500" size={14} fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {community.description}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users size={14} />
                      <span>{community.members} members</span>
                    </div>
                  </div>
                  <Button
                    variant={community.joined ? "secondary" : "default"}
                    size="sm"
                    disabled={community.joined}
                    className="ml-3 text-xs px-3 py-1.5 h-auto"
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
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{challenge.title}</h4>
                        {challenge.joined && (
                          <Star className="text-yellow-500" size={14} fill="currentColor" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {challenge.habit} • {challenge.duration}
                      </p>
                    </div>
                    <Button
                      variant={challenge.joined ? "secondary" : "default"}
                      size="sm"
                      disabled={challenge.joined}
                      className="ml-3 text-xs px-3 py-1.5 h-auto"
                    >
                      {challenge.joined ? "JOINED" : "JOIN"}
                    </Button>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{challenge.timeRemaining}</span>
                    </div>
                  </div>

                  {/* Progress (only for joined challenges) */}
                  {challenge.joined && (
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
                        <span className="text-gray-500">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1 text-xs">
                          <Trophy size={14} className="text-yellow-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Rank #{challenge.rank} of {challenge.totalParticipants}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-500 h-7 px-2 text-xs"
                          >
                            <Heart size={12} className="mr-1" />
                            Cheer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-500 h-7 px-2 text-xs"
                          >
                            <MessageCircle size={12} className="mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Playlist Component for joined challenges */}
                  {challenge.joined && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <ChallengePlaylist
                        challengeId={challenge.id}
                        challengeTitle={challenge.title}
                        isUserInChallenge={challenge.joined}
                      />
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
