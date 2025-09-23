import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Save, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import PastEntriesModal from './PastEntriesModal';

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  day: number;
}

const DailyJournalModal: React.FC<DailyJournalModalProps> = ({
  isOpen,
  onClose,
  date,
  day,
}) => {
  const [journalText, setJournalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'EEEE, MMMM d, yyyy');

  // Load existing journal entry when modal opens
  useEffect(() => {
    if (isOpen) {
      loadJournalEntry();
    }
  }, [isOpen, dateStr]);

  const loadJournalEntry = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_journals')
        .select('content')
        .eq('user_id', user.id)
        .eq('journal_date', dateStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading journal:', error);
        return;
      }

      setJournalText(data?.content || '');
    } catch (error) {
      console.error('Error loading journal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJournalEntry = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save journal entries.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('daily_journals')
        .upsert({
          user_id: user.id,
          journal_date: dateStr,
          content: journalText.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,journal_date'
        });

      if (error) {
        console.error('Error saving journal:', error);
        toast({
          title: "Error",
          description: "Failed to save journal entry. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Journal saved!",
        description: "Your daily reflection has been saved.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setJournalText('');
    onClose();
  };

  const handleEditEntry = (entryDate: Date, entryDay: number) => {
    // Close past entries modal and open the specific entry for editing
    setShowPastEntries(false);
    // The parent component should handle opening the journal for the specific date
    onClose();
    // For now, we'll just show a toast since we need to update the parent logic
    toast({
      title: "Entry Selected",
      description: `Selected entry for ${format(entryDate, 'MMM d, yyyy')}`,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Daily Journal - Day {day}
            </DialogTitle>
            <p className="text-muted-foreground font-medium">{displayDate}</p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-20"></div>
              <div className="pt-6">
                <label className="text-base font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  How was your day? What are you grateful for?
                </label>
                {isLoading ? (
                  <div className="relative">
                    <div className="h-40 bg-gradient-to-br from-muted via-muted/70 to-muted/50 animate-pulse rounded-xl border-2 border-dashed border-muted-foreground/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading your thoughts...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Textarea
                      placeholder="Write about your day, thoughts, feelings, or gratitude... ✨"
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      className="min-h-40 resize-none border-2 border-primary/20 focus:border-primary/40 rounded-xl bg-gradient-to-br from-background to-muted/30 text-base leading-relaxed shadow-inner transition-all duration-300 focus:shadow-lg"
                      maxLength={1000}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        journalText.length > 900 ? 'bg-destructive/20 text-destructive' :
                        journalText.length > 700 ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {journalText.length}/1000
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-between pt-4 border-t border-gradient-to-r from-transparent via-primary/20 to-transparent">
              <Button 
                variant="outline" 
                onClick={() => setShowPastEntries(true)}
                disabled={isSaving || isLoading}
                className="border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 font-medium"
              >
                <BookOpen className="h-4 w-4" />
                Past Entries
              </Button>
              <Button 
                onClick={saveJournalEntry} 
                disabled={isSaving || isLoading || !journalText.trim()}
                className="bg-gradient-to-r from-primary to-primary-foreground hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium px-6"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Journal
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    <PastEntriesModal
      isOpen={showPastEntries}
      onClose={() => setShowPastEntries(false)}
      onEditEntry={handleEditEntry}
    />
  </>
  );
};

export default DailyJournalModal;