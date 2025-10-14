import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DayWonMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DayWonMembersModal = ({ open, onOpenChange }: DayWonMembersModalProps) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['day-won-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, day_won_member_since')
        .eq('is_day_won_member', true)
        .order('day_won_member_since', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Day Won Members
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-950 ml-2">
              {members?.length || 0}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border animate-pulse">
                  <div className="h-14 w-14 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {members?.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10 hover:to-yellow-500/5 transition-all duration-300 group"
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20">
                      <AvatarImage src={member.avatar_url || ''} alt={member.display_name || ''} />
                      <AvatarFallback className="bg-yellow-500/10 text-yellow-700 font-bold">
                        {member.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                        1
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                        {member.display_name || 'Unknown User'}
                      </h3>
                      {index === 0 && (
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{member.username}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {member.day_won_member_since
                        ? format(new Date(member.day_won_member_since), 'MMM d, yyyy')
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
