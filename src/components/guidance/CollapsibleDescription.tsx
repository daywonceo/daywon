
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleDescriptionProps {
  text: string;
  maxLines?: number;
  className?: string;
}

const CollapsibleDescription = ({ 
  text, 
  maxLines = 2, 
  className = "" 
}: CollapsibleDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      const actualHeight = textRef.current.scrollHeight;
      setNeedsCollapse(actualHeight > maxHeight);
    }
  }, [text, maxLines]);

  if (!text) return null;

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${
          !isExpanded && needsCollapse 
            ? `line-clamp-${maxLines} overflow-hidden` 
            : ''
        }`}
      >
        {text}
      </p>
      
      {needsCollapse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-auto p-0 text-xs text-primary hover:opacity-80"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default CollapsibleDescription;
