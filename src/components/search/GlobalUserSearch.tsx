import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Search, Users } from 'lucide-react';
import { useMentions } from '@/hooks/useMentions';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}

interface GlobalUserSearchProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  className?: string;
  showEmpty?: boolean;
}

export const GlobalUserSearch = ({
  onUserSelect,
  placeholder = "Search users...",
  className,
  showEmpty = false
}: GlobalUserSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const { searchUsers } = useMentions();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchUsers(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  const handleUserClick = (user: User) => {
    onUserSelect?.(user);
    setQuery('');
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {showResults && (query.trim() || showEmpty) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching users...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((user) => (
                <button
                  key={user.id}
                  className="w-full px-4 py-3 text-left hover:bg-accent focus:bg-accent transition-colors"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={user.avatar_url || "/placeholder.svg"} 
                        alt={user.display_name}
                      />
                      <AvatarFallback>
                        {user.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {user.display_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </div>
                      {user.bio && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {user.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for a different name or username
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};