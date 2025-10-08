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
      <DialogHeader className={isMobile ? "px-4 pt-4" : "px-6 pt-6"}>
        <DialogTitle className={isMobile ? "text-base" : "text-lg"}>Friend Management</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`w-full grid grid-cols-4 ${isMobile ? "mx-4 h-9" : "mx-6 h-10"}`}>
          <TabsTrigger value="friends" className={isMobile ? "text-[10px] px-1" : "text-xs"}>
            <Users className={isMobile ? "w-3 h-3 mr-0.5" : "w-4 h-4 mr-1.5"} />
            <span className="hidden sm:inline">Friends</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className={isMobile ? "text-[10px] px-1" : "text-xs"}>
            <UserPlus className={isMobile ? "w-3 h-3 mr-0.5" : "w-4 h-4 mr-1.5"} />
            <span className="hidden sm:inline">Requests</span>
            <span className="sm:hidden">📬</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className={isMobile ? "text-[10px] px-1" : "text-xs"}>
            <Sparkles className={isMobile ? "w-3 h-3 mr-0.5" : "w-4 h-4 mr-1.5"} />
            <span className="hidden sm:inline">Suggestions</span>
            <span className="sm:hidden">✨</span>
          </TabsTrigger>
          <TabsTrigger value="discover" className={isMobile ? "text-[10px] px-1" : "text-xs"}>
            <Search className={isMobile ? "w-3 h-3 mr-0.5" : "w-4 h-4 mr-1.5"} />
            <span className="hidden sm:inline">Find</span>
            <span className="sm:hidden">🔍</span>
          </TabsTrigger>
        </TabsList>

        <div className={isMobile ? "px-4 pb-4" : "px-6 pb-6"}>
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
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 pb-safe-mobile">
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
