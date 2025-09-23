import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MentionsSuggestions } from './MentionsSuggestions';
import { useMentions } from '@/hooks/useMentions';
import { cn } from '@/lib/utils';

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export const MentionsInput = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  className,
  rows = 3,
  maxLength,
  disabled
}: MentionsInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [activeMention, setActiveMention] = useState({
    isActive: false,
    query: '',
    startIndex: -1,
    endIndex: -1
  });

  const { searchResults, isSearching, detectMentions, insertMention, setCurrentQuery } = useMentions();

  // Handle cursor position changes
  const handleSelectionChange = () => {
    if (!textareaRef.current) return;
    
    const position = textareaRef.current.selectionStart;
    setCursorPosition(position);
    
    const mention = detectMentions(value, position);
    setActiveMention(mention);
    
    if (mention.isActive) {
      setCurrentQuery(mention.query);
      setShowSuggestions(true);
      calculateSuggestionPosition(position);
    } else {
      setShowSuggestions(false);
      setCurrentQuery('');
    }
  };

  // Calculate position for suggestions dropdown
  const calculateSuggestionPosition = (position: number) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const textBeforeCursor = value.slice(0, position);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;
    
    // Approximate character width and line height
    const charWidth = 8;
    const lineHeight = 24;
    
    const rect = textarea.getBoundingClientRect();
    const top = rect.top + (currentLine * lineHeight) + lineHeight + 4;
    const left = rect.left + (charInLine * charWidth);
    
    setSuggestionPosition({ top, left });
  };

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Update cursor position after a short delay to ensure it's set correctly
    setTimeout(() => {
      handleSelectionChange();
    }, 0);
  };

  // Handle mention selection
  const handleMentionSelect = (username: string) => {
    if (!activeMention.isActive) return;
    
    const newText = insertMention(value, activeMention, username);
    onChange(newText);
    
    // Close suggestions
    setShowSuggestions(false);
    setCurrentQuery('');
    setActiveMention({ isActive: false, query: '', startIndex: -1, endIndex: -1 });
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape')) {
      e.preventDefault();
      // Let MentionsSuggestions handle these events
      return;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("resize-none", className)}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
      />
      
      {showSuggestions && (activeMention.isActive || isSearching || searchResults.length > 0) && (
        <MentionsSuggestions
          users={searchResults}
          isLoading={isSearching}
          onSelect={handleMentionSelect}
          query={activeMention.query}
          position={suggestionPosition}
        />
      )}
    </div>
  );
};