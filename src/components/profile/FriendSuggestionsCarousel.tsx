import { useFriendSuggestions } from '@/hooks/useFriendSuggestions';
import { useFriends } from '@/hooks/useFriends';
import { FriendSuggestionCard } from './FriendSuggestionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const FriendSuggestionsCarousel = () => {
  const { suggestions, loading, dismissSuggestion } = useFriendSuggestions();
  const { sendFriendRequest } = useFriends();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Friend Suggestions</h3>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-64 h-40 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">People You May Know</h3>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.user_id} className="flex-shrink-0 w-64">
                <FriendSuggestionCard
                  suggestion={suggestion}
                  onAddFriend={sendFriendRequest}
                  onDismiss={dismissSuggestion}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
