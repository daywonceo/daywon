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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-background border-accent/20">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-3 shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-accent">
            Past Journal Entries
          </DialogTitle>
          <p className="text-muted-foreground">Your journey through words and memories</p>
        </DialogHeader>

        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent rounded-full opacity-20"></div>
          <ScrollArea className="h-[60vh] pr-4 pt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-accent/10">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 w-4 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-3 bg-muted rounded mb-2 w-full"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No journal entries yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Start journaling by clicking on any day number to create your first entry and begin your mindful journey.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer group border-accent/10 bg-background"
                    onClick={() => handleEditEntry(entry)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span className="font-semibold text-sm text-foreground">
                              {format(new Date(entry.journal_date), 'EEEE, MMMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {truncateContent(entry.content)}
                          </p>
                          {entry.updated_at !== entry.created_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                              Last edited: {format(new Date(entry.updated_at), 'MMM d, h:mm a')}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300 flex-shrink-0 ml-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-6 border-t border-accent/20">
          <Button
            variant="outline" 
            onClick={onClose}
            className="border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-300 font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PastEntriesModal;