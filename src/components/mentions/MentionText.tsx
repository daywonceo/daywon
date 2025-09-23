import React from 'react';
import { UserMention } from './UserMention';
import { useMentions } from '@/hooks/useMentions';

interface MentionTextProps {
  text: string;
  className?: string;
  onMentionClick?: (username: string) => void;
}

export const MentionText = ({ text, className, onMentionClick }: MentionTextProps) => {
  const { parseMentions } = useMentions();
  const parts = parseMentions(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        }
        
        return (
          <UserMention
            key={index}
            username={part.username}
            variant="inline"
            onClick={onMentionClick ? () => onMentionClick(part.username) : undefined}
          />
        );
      })}
    </span>
  );
};