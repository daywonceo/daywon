import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Sparkles, Search } from 'lucide-react';
import FriendList from './FriendList';
import { FriendSuggestionsCarousel } from '@/components/profile/FriendSuggestionsCarousel';
import { GlobalUserSearch } from '@/components/search/GlobalUserSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface FriendManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'friends' | 'pending' | 'suggestions' | 'discover';
}

export const FriendManagementDialog = ({ 
  open, 
  onOpenChange,
  defaultTab = 'friends' 
}: FriendManagementDialogProps) => {
  const isMobile = useIsMobile();

  const content = (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>Friend Management</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mx-6">
          <TabsTrigger value="friends" className="text-xs">
            <Users className="w-4 h-4 mr-1.5" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="discover" className="text-xs">
            <Search className="w-4 h-4 mr-1.5" />
            Find
          </TabsTrigger>
        </TabsList>

        <div className="px-6 pb-6">
          <TabsContent value="friends" className="mt-4">
            <FriendList />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <FriendList defaultTab="pending" />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <FriendSuggestionsCarousel />
          </TabsContent>

          <TabsContent value="discover" className="mt-4">
            <GlobalUserSearch 
              placeholder="Search for friends..."
              showEmpty={true}
            />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Friend Management</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};
