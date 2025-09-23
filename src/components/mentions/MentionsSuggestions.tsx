import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface MentionsSuggestionsProps {
  users: User[];
  isLoading: boolean;
  onSelect: (username: string) => void;
  query: string;
  position: { top: number; left: number };
}

export const MentionsSuggestions = ({
  users,
  isLoading,
  onSelect,
  query,
  position
}: MentionsSuggestionsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!users.length && !isLoading) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % users.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (users[selectedIndex]) {
            onSelect(users[selectedIndex].username);
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Parent component will handle closing
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex, onSelect]);

  if (!isLoading && users.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 w-80 max-w-sm bg-popover border border-border rounded-md shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(4px)'
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="py-1">
            {users.map((user, index) => (
              <button
                key={user.id}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent transition-colors",
                  selectedIndex === index && "bg-accent"
                )}
                onClick={() => onSelect(user.username)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage 
                      src={user.avatar_url || "/placeholder.svg"} 
                      alt={user.display_name}
                    />
                    <AvatarFallback className="text-xs">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {highlightMatch(user.display_name, query)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{highlightMatch(user.username, query)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center">
            <span className="text-sm text-muted-foreground">No users found</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="font-semibold text-foreground">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};