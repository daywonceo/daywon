import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Trophy, Clock, Heart, MessageCircle, Star, Target, Pin, ArrowLeft, Send, Share, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChallengePlaylist from "./ChallengePlaylist";
import CommunityDetail from "./CommunityDetail";
import ChallengeDetail from "./ChallengeDetail";
import InviteModal from "./InviteModal";
import AllMembersView from "./AllMembersView";
import MemberCard from "./MemberCard";

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

interface ChallengeParticipant {
  id: number;
  name: string;
  avatar: string;
  progress: number;
  dayStreak: number;
  totalDays: number;
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

const Groups = () => {
  const [activeTab, setActiveTab] = useState<"communities" | "challenges">("communities");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [allMembersView, setAllMembersView] = useState<{
    isOpen: boolean;
    title: string;
    members: User[];
  }>({ isOpen: false, title: "", members: [] });
  const [newMessage, setNewMessage] = useState("");
  const [inviteModal, setInviteModal] = useState<{ 
    isOpen: boolean; 
    type: 'community' | 'challenge'; 
    data: Community | Challenge | null; 
  }>({ 
    isOpen: false, 
    type: 'community', 
    data: null 
  });
  const { toast } = useToast();
  
  // Mock current user for auth checks
  const currentUser = { id: 1, name: "Current User" };

  // Mock users with better profile pictures
  const mockUsers: User[] = [
    { id: 1, name: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", initials: "AC", topHabits: ["Morning Prayer", "Exercise"], streak: 15 },
    { id: 2, name: "Maya Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face", initials: "MJ", topHabits: ["Bible Study", "Meditation"], streak: 22 },
    { id: 3, name: "Nate Rodriguez", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", initials: "NR", topHabits: ["Workout", "Meal Prep", "Scripture"], streak: 10 },
    { id: 4, name: "Sarah Kim", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", initials: "SK", topHabits: ["Yoga", "Prayer", "Gratitude"], streak: 28 },
    { id: 5, name: "David Park", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", initials: "DP", topHabits: ["Running", "Devotions"], streak: 18 },
    { id: 6, name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", initials: "EW", topHabits: ["Stretching", "Bible Reading"], streak: 7 },
    { id: 7, name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face", initials: "JL", topHabits: ["Gym", "Prayer Walk", "Study"], streak: 12 },
    { id: 8, name: "Taylor Brown", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", initials: "TB", topHabits: ["Morning Routine", "Scripture"], streak: 25 }
  ];

  const communities: Community[] = [
    {
      id: 1,
      name: "📖 Morning Devotion Circle",
      description: "Start each day with scripture and prayer together",
      members: mockUsers.slice(0, 5),
      joined: true,
      category: "SPIRITUAL",
      pinnedMessage: "🌅 This week's focus: Psalm 23. Share your reflections!",
      recentMessages: [
        { id: 1, userId: 2, userName: "Maya Johnson", avatar: "/placeholder.svg", message: "Just finished today's reading! 🙏", timestamp: "2 min ago", emoji: "🙏" },
        { id: 2, userId: 4, userName: "Sarah Kim", avatar: "/placeholder.svg", message: "Great discussion yesterday about patience 💫", timestamp: "1 hr ago" },
        { id: 3, userId: 1, userName: "Alex Chen", avatar: "/placeholder.svg", message: "Anyone else loving this Psalm series?", timestamp: "3 hrs ago", emoji: "❤️" }
      ]
    },
    {
      id: 2,
      name: "💪 5AM Gym Club",
      description: "Early birds crushing workouts before sunrise",
      members: mockUsers.slice(2, 7),
      joined: false,
      category: "FITNESS",
      pinnedMessage: "💪 Week 3 Challenge: Add 5 minutes to your cardio!",
      recentMessages: [
        { id: 4, userId: 3, userName: "Nate Rodriguez", avatar: "/placeholder.svg", message: "Crushed leg day this morning! 🔥", timestamp: "15 min ago", emoji: "🔥" },
        { id: 5, userId: 7, userName: "Jordan Lee", avatar: "/placeholder.svg", message: "New bench press PR today! 💪", timestamp: "45 min ago" },
        { id: 6, userId: 5, userName: "David Park", avatar: "/placeholder.svg", message: "Running group at 5:30 tomorrow?", timestamp: "2 hrs ago" }
      ]
    },
    {
      id: 3,
      name: "🥗 Healthy Habits Crew",
      description: "Nutrition, meal prep, and wellness journey together",
      members: mockUsers.slice(3, 8),
      joined: true,
      category: "NUTRITION",
      pinnedMessage: "🥗 Meal Prep Sunday tips: Prep proteins first, then veggies!",
      recentMessages: [
        { id: 7, userId: 6, userName: "Emma Wilson", avatar: "/placeholder.svg", message: "Made the best green smoothie today! 🥬", timestamp: "30 min ago", emoji: "🥬" },
        { id: 8, userId: 8, userName: "Taylor Brown", avatar: "/placeholder.svg", message: "Sharing my meal prep containers in photos 📸", timestamp: "1 hr ago" },
        { id: 9, userId: 4, userName: "Sarah Kim", avatar: "/placeholder.svg", message: "Week 2 of no processed foods! Feeling great ✨", timestamp: "4 hrs ago", emoji: "✨" }
      ]
    }
  ];

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Stretch Daily for 30 Days",
      habit: "STRETCHING",
      duration: "30 days",
      participants: [
        { id: 3, name: "Nate Rodriguez", avatar: "/placeholder.svg", progress: 47, dayStreak: 14, totalDays: 30 },
        { id: 2, name: "Maya Johnson", avatar: "/placeholder.svg", progress: 73, dayStreak: 22, totalDays: 30 },
        { id: 6, name: "Emma Wilson", avatar: "/placeholder.svg", progress: 23, dayStreak: 7, totalDays: 30 },
        { id: 4, name: "Sarah Kim", avatar: "/placeholder.svg", progress: 93, dayStreak: 28, totalDays: 30 },
        { id: 7, name: "Jordan Lee", avatar: "/placeholder.svg", progress: 40, dayStreak: 12, totalDays: 30 }
      ],
      progress: 67,
      rank: 3,
      totalParticipants: 5,
      timeRemaining: "8 days left",
      joined: true,
      communityId: 2,
      chatMessages: [
        { id: 10, userId: 4, userName: "Sarah Kim", avatar: "/placeholder.svg", message: "Let's go team! 💪", timestamp: "5 min ago", emoji: "💪" },
        { id: 11, userId: 2, userName: "Maya Johnson", avatar: "/placeholder.svg", message: "Hit 5 days in a row! 🔥", timestamp: "2 hrs ago", emoji: "🔥" },
        { id: 12, userId: 3, userName: "Nate Rodriguez", avatar: "/placeholder.svg", message: "My hamstrings are thanking me already 😅", timestamp: "1 day ago" }
      ]
    },
    {
      id: 2,
      title: "Morning Prayer - 21 Days",
      habit: "PRAYER",
      duration: "21 days",
      participants: [
        { id: 1, name: "Alex Chen", avatar: "/placeholder.svg", progress: 71, dayStreak: 15, totalDays: 21 },
        { id: 2, name: "Maya Johnson", avatar: "/placeholder.svg", progress: 100, dayStreak: 21, totalDays: 21 },
        { id: 4, name: "Sarah Kim", avatar: "/placeholder.svg", progress: 81, dayStreak: 17, totalDays: 21 },
        { id: 5, name: "David Park", avatar: "/placeholder.svg", progress: 86, dayStreak: 18, totalDays: 21 }
      ],
      progress: 71,
      rank: 3,
      totalParticipants: 4,
      timeRemaining: "6 days left",
      joined: true,
      communityId: 1,
      chatMessages: [
        { id: 13, userId: 2, userName: "Maya Johnson", avatar: "/placeholder.svg", message: "Completed the full 21 days! 🙌", timestamp: "1 hr ago", emoji: "🙌" },
        { id: 14, userId: 1, userName: "Alex Chen", avatar: "/placeholder.svg", message: "This challenge has been life-changing 🙏", timestamp: "3 hrs ago", emoji: "🙏" },
        { id: 15, userId: 5, userName: "David Park", avatar: "/placeholder.svg", message: "Almost there everyone! Keep going!", timestamp: "5 hrs ago" }
      ]
    },
    {
      id: 3,
      title: "Healthy Meal Prep Challenge",
      habit: "MEAL PREP",
      duration: "14 days",
      participants: [
        { id: 6, name: "Emma Wilson", avatar: "/placeholder.svg", progress: 50, dayStreak: 7, totalDays: 14 },
        { id: 8, name: "Taylor Brown", avatar: "/placeholder.svg", progress: 86, dayStreak: 12, totalDays: 14 },
        { id: 4, name: "Sarah Kim", avatar: "/placeholder.svg", progress: 79, dayStreak: 11, totalDays: 14 }
      ],
      progress: 0,
      rank: 0,
      totalParticipants: 3,
      timeRemaining: "7 days left",
      joined: false,
      communityId: 3,
      chatMessages: [
        { id: 16, userId: 8, userName: "Taylor Brown", avatar: "/placeholder.svg", message: "Sunday prep session complete! 🥗", timestamp: "2 hrs ago", emoji: "🥗" },
        { id: 17, userId: 6, userName: "Emma Wilson", avatar: "/placeholder.svg", message: "Love the overnight oats recipe!", timestamp: "1 day ago" }
      ]
    }
  ];

  const handleJoinCommunity = (communityId: number) => {
    toast({
      title: "Joined Community!",
      description: "Welcome to the group! Start chatting with members.",
    });
  };

  const handleJoinChallenge = (challengeId: number) => {
    toast({
      title: "Challenge Accepted!",
      description: "You're now part of this challenge. Good luck!",
    });
  };

  const handleLeaveChallenge = (challengeId: number, challengeTitle: string) => {
    if (confirm(`Are you sure you want to leave "${challengeTitle}"?`)) {
      toast({
        title: "Left Challenge",
        description: "You've been removed from this challenge.",
      });
    }
  };

  const sendMessage = (type: 'community' | 'challenge', id: number) => {
    if (!newMessage.trim()) return;
    
    toast({
      title: "Message Sent!",
      description: "Your message has been posted to the group.",
    });
    setNewMessage("");
  };

  const handleInvite = async (type: 'community' | 'challenge', data: Community | Challenge) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/invite/${type}/${data.id}`;
    
    try {
      // Use Web Share API if available
      if (navigator.share) {
        const displayName = type === 'community' ? (data as Community).name : (data as Challenge).title;
        await navigator.share({
          title: `Join this ${type}!`,
          text: `I think you'd love this ${type}: "${displayName}"`,
          url: inviteLink,
        });
        toast({
          title: "Invitation Sent!",
          description: "Your invite has been shared successfully.",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: "Link Copied!",
          description: "The invite link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // Fallback for older browsers
      toast({
        title: "Invite Link Ready",
        description: `Share this link: ${inviteLink}`,
      });
    }
  };

  const openInviteModal = (type: 'community' | 'challenge', data: Community | Challenge) => {
    setInviteModal({ isOpen: true, type, data });
  };

  const handleJoinFromModal = (id: number) => {
    if (inviteModal.type === 'community') {
      handleJoinCommunity(id);
    } else {
      handleJoinChallenge(id);
    }
  };

  const handleViewAllMembers = (title: string, members: User[]) => {
    setAllMembersView({ isOpen: true, title, members });
  };

  const handleMemberMessage = (memberId: number) => {
    toast({
      title: "Message Sent!",
      description: "Your message has been delivered.",
    });
  };

  // Show all members view if active
  if (allMembersView.isOpen) {
    return (
      <AllMembersView
        title={allMembersView.title}
        members={allMembersView.members}
        onBack={() => setAllMembersView({ isOpen: false, title: "", members: [] })}
        currentUserId={currentUser.id}
      />
    );
  }

  // Show detailed view if selected
  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        onBack={() => setSelectedCommunity(null)}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={() => sendMessage('community', selectedCommunity.id)}
        onInvite={(community) => handleInvite('community', community)}
        onViewAllMembers={handleViewAllMembers}
      />
    );
  }

  if (selectedChallenge) {
    return (
      <ChallengeDetail
        challenge={selectedChallenge}
        onBack={() => setSelectedChallenge(null)}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={() => sendMessage('challenge', selectedChallenge.id)}
        onLeaveChallenge={() => handleLeaveChallenge(selectedChallenge.id, selectedChallenge.title)}
        onInvite={(challenge) => handleInvite('challenge', challenge)}
        onViewAllMembers={handleViewAllMembers}
      />
    );
  }

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
            <Card 
              key={community.id} 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedCommunity(community)}
            >
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
                      <span>{community.members.length} members</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInvite('community', community);
                      }}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-500"
                    >
                      <Send size={14} />
                    </Button>
                    <Button
                      variant={community.joined ? "secondary" : "default"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!community.joined) {
                          handleJoinCommunity(community.id);
                        }
                      }}
                      disabled={community.joined}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      {community.joined ? "JOINED" : "JOIN"}
                    </Button>
                  </div>
                </div>
                

                {/* Recent Activity Preview */}
                {community.joined && community.recentMessages.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Recent activity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={community.recentMessages[0].avatar} />
                        <AvatarFallback className="text-xs">
                          {community.recentMessages[0].userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                        <span className="font-medium">{community.recentMessages[0].userName}:</span> {community.recentMessages[0].message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedChallenge(challenge)}
            >
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
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvite('challenge', challenge);
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-500"
                      >
                        <Send size={14} />
                      </Button>
                      <Button
                        variant={challenge.joined ? "secondary" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!challenge.joined) {
                            handleJoinChallenge(challenge.id);
                          }
                        }}
                        disabled={challenge.joined}
                        className="text-xs px-3 py-1.5 h-auto"
                      >
                        {challenge.joined ? "JOINED" : "JOIN"}
                      </Button>
                    </div>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{challenge.participants.length} participants</span>
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
                            Rank #{challenge.rank} of {challenge.participants.length}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-500 h-7 px-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart size={12} className="mr-1" />
                            Cheer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-500 h-7 px-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle size={12} className="mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Chat Preview */}
                  {challenge.chatMessages.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Recent chat</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={challenge.chatMessages[0].avatar} />
                          <AvatarFallback className="text-xs">
                            {challenge.chatMessages[0].userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                          <span className="font-medium">{challenge.chatMessages[0].userName}:</span> {challenge.chatMessages[0].message}
                        </p>
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

      {/* Invite Modal */}
      {inviteModal.data && (
        <InviteModal
          isOpen={inviteModal.isOpen}
          onClose={() => setInviteModal({ ...inviteModal, isOpen: false })}
          type={inviteModal.type}
          data={inviteModal.data}
          currentUser={currentUser}
          onJoin={handleJoinFromModal}
        />
      )}
    </div>
  );
};

export default Groups;