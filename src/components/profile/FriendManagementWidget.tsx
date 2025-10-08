import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Settings, Mail, Shield, ContactRound } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useState } from 'react';
import { FriendManagementDialog } from '@/components/social/FriendManagementDialog';
import { InviteFriendsDialog } from '@/components/social/InviteFriendsDialog';
import { PrivacySettingsDialog } from '@/components/social/PrivacySettingsDialog';
import { ContactSyncDialog } from '@/components/social/ContactSyncDialog';

export const FriendManagementWidget = () => {
  const { friends, pendingRequests, loading } = useFriends();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'suggestions' | 'discover'>('friends');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [contactSyncOpen, setContactSyncOpen] = useState(false);

  const openDialog = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">Friends & Connections</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDialog('friends')}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div
              className="p-2.5 sm:p-3 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => openDialog('friends')}
            >
              <div className="text-xl sm:text-2xl font-bold text-primary">{friends.length}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Friends</div>
            </div>
            
            <div
              className="p-2.5 sm:p-3 rounded-lg bg-orange-500/5 cursor-pointer hover:bg-orange-500/10 transition-colors relative"
              onClick={() => openDialog('pending')}
            >
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Requests</div>
              {pendingRequests.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[9px] sm:text-[10px] bg-orange-500">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={() => openDialog('discover')}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add Friends
              </Button>
              <Button
                variant="default"
                className="flex-1"
                size="sm"
                onClick={() => openDialog('friends')}
              >
                <Users className="w-4 h-4 mr-1.5" />
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInviteDialogOpen(true)}
                className="text-xs"
              >
                <Mail className="w-3 h-3 mr-1" />
                Invite
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContactSyncOpen(true)}
                className="text-xs"
              >
                <ContactRound className="w-3 h-3 mr-1" />
                Contacts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrivacyDialogOpen(true)}
                className="text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                Privacy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FriendManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTab={activeTab}
      />

      <InviteFriendsDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <PrivacySettingsDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
      />

      <ContactSyncDialog
        open={contactSyncOpen}
        onOpenChange={setContactSyncOpen}
      />
    </>
  );
};
