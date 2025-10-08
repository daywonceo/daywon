
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, MessageCircle, Search, Users, UserCheck, UserX, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFriends } from "@/hooks/useFriends";
import { useSocialProfiles } from "@/hooks/useSocialProfiles";

interface FriendListProps {
  defaultTab?: 'friends' | 'pending' | 'discover';
}

const FriendList = ({ defaultTab = 'friends' }: FriendListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'discover'>(defaultTab);
  
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    loading: friendsLoading,
    acceptFriendRequest,
    declineFriendRequest,
    sendFriendRequest,
    removeFriend,
  } = useFriends();
  
  const { profiles, discoverProfiles, loading: profilesLoading } = useSocialProfiles();
  const [potentialFriends, setPotentialFriends] = useState<any[]>([]);
  
  // Load potential friends for discovery
  useEffect(() => {
    if (activeTab === 'discover') {
      const loadPotentialFriends = async () => {
        const discovered = await discoverProfiles(searchTerm || undefined);
        setPotentialFriends(discovered);
      };
      loadPotentialFriends();
    }
  }, [activeTab, searchTerm, discoverProfiles]);
  
  // Filter based on active tab
  const getFilteredItems = () => {
    let items: any[] = [];
    
    if (activeTab === 'friends') {
      items = friends;
    } else if (activeTab === 'pending') {
      items = pendingRequests;
    } else {
      items = potentialFriends;
    }
    
    return items.filter(item => {
      const name = item.display_name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };
  
  const filteredItems = getFilteredItems();

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2 sm:mb-3">
          <Users className="text-blue-600 dark:text-blue-400" size={18} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Social Network</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Connect and motivate each other</p>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="flex gap-1 sm:gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 min-w-[90px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'friends' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 min-w-[90px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 min-w-[90px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'discover' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Discover
        </button>
      </div>
      
      {/* Search - Mobile Optimized */}
      <div className="relative">
        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 sm:pl-10 pr-3 h-9 sm:h-10 text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700"
        />
      </div>
      
      {/* Items List - Mobile Optimized */}
      <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto px-1">
        {friendsLoading || profilesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isProfile = 'created_at' in item;
            const displayName = item.display_name || 'Unknown User';
            const avatarUrl = isProfile ? item.avatar_url : item.avatar_url;
            const status = isProfile ? item.status : item.status;
            
            return (
              <Card key={item.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-green-100 dark:ring-green-800/50">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                          <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs sm:text-sm font-semibold">
                            {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 ${getStatusColor(status)} border-2 border-white dark:border-gray-800 rounded-full`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                          {getStatusText(status)}
                          {'mutual_habits' in item && item.mutual_habits && ` • ${item.mutual_habits} mutual`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons - Mobile Optimized */}
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      {activeTab === 'friends' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFriend(item.id)}
                            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <UserX size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        </>
                      )}
                      
                      {activeTab === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => acceptFriendRequest(item.id)}
                            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                          >
                            <UserCheck size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => declineFriendRequest(item.id)}
                            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <UserX size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        </>
                      )}
                      
                      {activeTab === 'discover' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => sendFriendRequest(item.id)}
                          className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <UserPlus size={14} className="sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* No Results */}
      {filteredItems.length === 0 && searchTerm && !friendsLoading && !profilesLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No results found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Empty States */}
      {filteredItems.length === 0 && !searchTerm && !friendsLoading && !profilesLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {activeTab === 'friends' ? "You haven't added any friends yet" :
             activeTab === 'pending' ? "No pending friend requests" :
             "No new users to discover"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === 'friends' ? "Start connecting with others!" :
             activeTab === 'pending' ? "Friend requests will appear here" :
             "Check back later for more users"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendList;
