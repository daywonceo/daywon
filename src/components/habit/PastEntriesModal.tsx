import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  journal_date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PastEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditEntry: (date: Date, day: number) => void;
}

const PastEntriesModal: React.FC<PastEntriesModalProps> = ({
  isOpen,
  onClose,
  onEditEntry,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPastEntries();
    }
  }, [isOpen]);

  const loadPastEntries = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('journal_date', { ascending: false });

      if (error) {
        console.error('Error loading journal entries:', error);
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    const date = new Date(entry.journal_date);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    onEditEntry(date, diffDays);
    onClose();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Past Journal Entries
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                    <div className="h-3 bg-muted rounded mb-1 w-full"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p className="text-muted-foreground">
                Start journaling by clicking on any day number to create your first entry.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {format(new Date(entry.journal_date), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {truncateContent(entry.content)}
                        </p>
                        {entry.updated_at !== entry.created_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Last edited: {format(new Date(entry.updated_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PastEntriesModal;