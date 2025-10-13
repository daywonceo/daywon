import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Search, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/shared/LoadingStates';

interface InviteToChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeTitle: string;
}

interface Friend {
  id: string;
  display_name: string;
  avatar_url: string;
  username: string;
  is_participating: boolean;
}

const InviteToChallengeModal = ({ 
  open, 
  onOpenChange, 
  challengeId,
  challengeTitle 
}: InviteToChallengeModalProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open, challengeId]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's friends
      const { data: friendships } = await supabase
        .from('user_relationships')
        .select('follower_id, following_id')
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!friendships || friendships.length === 0) {
        setLoading(false);
        return;
      }

      const friendIds = friendships.map(f => 
        f.follower_id === user.id ? f.following_id : f.follower_id
      );

      // Get friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, username')
        .in('id', friendIds);

      // Check which friends are already participating
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select('user_id')
        .eq('challenge_id', challengeId)
        .in('user_id', friendIds);

      const participatingIds = new Set(participants?.map(p => p.user_id) || []);

      const friendsList: Friend[] = (profiles || []).map(p => ({
        id: p.id,
        display_name: p.display_name || 'User',
        avatar_url: p.avatar_url || '',
        username: p.username || '',
        is_participating: participatingIds.has(p.id),
      }));

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleSendInvites = async () => {
    if (selectedFriends.size === 0) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create notifications for each selected friend
      const notifications = Array.from(selectedFriends).map(friendId => ({
        user_id: friendId,
        actor_id: user.id,
        type: 'challenge_invite',
        entity_type: 'challenge',
        entity_id: challengeId,
        message: `invited you to join "${challengeTitle}"`,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "Invitations sent!",
        description: `Successfully invited ${selectedFriends.size} ${selectedFriends.size === 1 ? 'friend' : 'friends'}`,
      });

      setSelectedFriends(new Set());
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error sending invitations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    !f.is_participating &&
    (f.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     f.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus size={20} />
            <span>Invite Friends to Challenge</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Friends List */}
          {loading ? (
            <LoadingSpinner message="Loading friends..." />
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No friends found' : 'All your friends are already in this challenge!'}
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleToggleFriend(friend.id)}
                >
                  <Checkbox
                    checked={selectedFriends.has(friend.id)}
                    onCheckedChange={() => handleToggleFriend(friend.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {friend.display_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.display_name}</p>
                    <p className="text-sm text-muted-foreground truncate">@{friend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedFriends.size} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendInvites}
                disabled={selectedFriends.size === 0 || sending}
              >
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Invites
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteToChallengeModal;
