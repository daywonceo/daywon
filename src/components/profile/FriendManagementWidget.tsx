import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Settings } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useState } from 'react';
import { FriendManagementDialog } from '@/components/social/FriendManagementDialog';

export const FriendManagementWidget = () => {
  const { friends, pendingRequests, loading } = useFriends();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'suggestions' | 'discover'>('friends');

  const openDialog = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Friends & Connections</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDialog('friends')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="p-3 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => openDialog('friends')}
            >
              <div className="text-2xl font-bold text-primary">{friends.length}</div>
              <div className="text-xs text-muted-foreground">Friends</div>
            </div>
            
            <div
              className="p-3 rounded-lg bg-orange-500/5 cursor-pointer hover:bg-orange-500/10 transition-colors relative"
              onClick={() => openDialog('pending')}
            >
              <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
              <div className="text-xs text-muted-foreground">Requests</div>
              {pendingRequests.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
          </div>

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
        </CardContent>
      </Card>

      <FriendManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTab={activeTab}
      />
    </>
  );
};
